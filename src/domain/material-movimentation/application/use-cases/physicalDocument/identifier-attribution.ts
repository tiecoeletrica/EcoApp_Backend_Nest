import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { PhysicalDocument } from "../../../enterprise/entities/physical-document";
import { PhysicalDocumentRepository } from "../../repositories/physical-document-repository";
import { ResourceAlreadyRegisteredError } from "../../../../../core/errors/errors/resource-already-registered-error";
import { ProjectRepository } from "../../repositories/project-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { NotValidError } from "src/core/errors/errors/not-valid-error";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";

interface IdentifierAttributionUseCaseRequest {
  project_number: string;
  identifier: number;
  baseId: string;
  contractId: string;
}

type IdentifierAttributionResponse = Eihter<
  ResourceAlreadyRegisteredError | ResourceNotFoundError | NotValidError,
  {
    physicalDocument: PhysicalDocument;
  }
>;

@Injectable()
export class IdentifierAttributionUseCase {
  constructor(
    private physicaldocumentRepository: PhysicalDocumentRepository,
    private projectRepository: ProjectRepository
  ) {}

  async execute({
    project_number,
    identifier,
    baseId,
    contractId,
  }: IdentifierAttributionUseCaseRequest): Promise<IdentifierAttributionResponse> {
    const searchResult = await this.resourceSearch(
      project_number,
      identifier,
      baseId,
      contractId
    );

    if (searchResult.isLeft()) {
      return left(searchResult.value);
    }
    const { project, physicaldocumentSearch } = searchResult.value;

    const verificationResult = this.verifyConditions(
      project,
      physicaldocumentSearch,
      identifier
    );

    if (verificationResult.isLeft()) {
      return left(verificationResult.value);
    }

    return await this.managePhysicalDocument(
      project,
      physicaldocumentSearch,
      identifier,
      baseId
    );
  }

  private async resourceSearch(
    project_number: string,
    identifier: number,
    baseId: string,
    contractId: string
  ): Promise<
    Eihter<
      ResourceNotFoundError,
      { project: Project; physicaldocumentSearch: PhysicalDocument[] }
    >
  > {
    const project =
      await this.projectRepository.findByProjectNumberAndContractId(
        project_number,
        contractId
      );

    if (!project) {
      return left(
        new ResourceNotFoundError(
          `O projeto ${project_number} não foi encontrado`
        )
      );
    }

    const physicaldocumentSearch =
      await this.physicaldocumentRepository.findByIdentifierOrProjectId(
        identifier,
        project.id.toString(),
        baseId
      );

    return right({ project, physicaldocumentSearch });
  }

  private verifyConditions(
    project: Project,
    physicaldocumentSearch: PhysicalDocument[],
    identifier: number
  ): Eihter<ResourceAlreadyRegisteredError | NotValidError, null> {
    const isIdentifierUsed = physicaldocumentSearch.find(
      (item) => item.identifier === identifier && item.unitized === false
    );

    /* verificando se o ID está sendo usado e não é kit nem medidor. 
    Se for medidor ou kit ele permite seguir com as 
    verificações mesmo com o identificador estando em uso */
    if (
      isIdentifierUsed &&
      !["KIT", "MEDIDOR"].includes(project.type.toUpperCase())
    ) {
      return left(
        new ResourceAlreadyRegisteredError(
          `O ID ${identifier} já está sendo utilizado`
        )
      );
    }

    /*verifica se o idenficicador já possui un projeto de 
    obra antes de incluir um projeto do tipo medidor ou kit*/
    if (
      !isIdentifierUsed &&
      ["KIT", "MEDIDOR"].includes(project.type.toUpperCase())
    ) {
      return left(
        new NotValidError(
          `O projeto da obra precisa ser atribuido antes do projeto do ${project.type.toUpperCase()}.`
        )
      );
    }

    const isProjectIdUsed = physicaldocumentSearch.find((item) => {
      switch (project.type.toUpperCase()) {
        case "KIT":
          return item.projectKitId?.toString() === project.id.toString();
        case "MEDIDOR":
          return item.projectMeterId?.toString() === project.id.toString();
        default:
          return item.projectId.toString() === project.id.toString();
      }
    });

    // verifica, ja pelo tipo, se aquele projeto está em algum outro identificador
    if (isProjectIdUsed) {
      return left(
        new ResourceAlreadyRegisteredError(
          `O Projeto ${project.project_number} está cadastrado no ID ${isProjectIdUsed.identifier}`
        )
      );
    }

    return right(null);
  }

  private async managePhysicalDocument(
    project: Project,
    physicaldocumentSearch: PhysicalDocument[],
    identifier: number,
    baseId: string
  ): Promise<IdentifierAttributionResponse> {
    const isIdentifierUsed = physicaldocumentSearch.find(
      (item) => item.identifier === identifier && item.unitized === false
    );

    let physicalDocument: PhysicalDocument;
    if (["KIT", "MEDIDOR"].includes(project.type.toUpperCase())) {
      physicalDocument = isIdentifierUsed!;

      if (project.type.toUpperCase() === "KIT") {
        if (physicalDocument.projectKitId !== undefined) {
          return left(
            new ResourceAlreadyRegisteredError(
              `Já existe um projeto de KIT cadastrado nesse ID`
            )
          );
        }

        physicalDocument.projectKitId = project.id;
      } else {
        if (physicalDocument.projectMeterId !== undefined) {
          return left(
            new ResourceAlreadyRegisteredError(
              `Já existe um projeto de MEDIDOR cadastrado nesse ID`
            )
          );
        }

        physicalDocument.projectMeterId = project.id;
      }

      await this.physicaldocumentRepository.save(physicalDocument);
    } else {
      physicalDocument = PhysicalDocument.create({
        projectId: project.id,
        identifier,
        baseId: new UniqueEntityID(baseId),
      });

      await this.physicaldocumentRepository.create(physicalDocument);
    }

    return right({ physicalDocument });
  }
}
