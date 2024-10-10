import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { PhysicalDocument } from "../../../enterprise/entities/physical-document";
import { PhysicalDocumentRepository } from "../../repositories/physical-document-repository";
import { ResourceAlreadyRegisteredError } from "../errors/resource-already-registered-error";
import { ProjectRepository } from "../../repositories/project-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

interface IdentifierAttributionUseCaseRequest {
  project_number: string;
  identifier: number;
  baseId: string;
}

type IdentifierAttributionResponse = Eihter<
  ResourceAlreadyRegisteredError | ResourceNotFoundError,
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
  }: IdentifierAttributionUseCaseRequest): Promise<IdentifierAttributionResponse> {
    const project = await this.projectRepository.findByProjectNumberWithoutBase(
      project_number
    );
    if (!project)
      return left(new ResourceNotFoundError("O projeto não foi encontrado"));

    const physicaldocumentSearch =
      await this.physicaldocumentRepository.findByIdentifierOrProjectId(
        identifier,
        project.id.toString(),
        baseId
      );

    const isIdentifierUsed = physicaldocumentSearch.find(
      (item) => item.identifier === identifier && item.unitized === false
    );

    if (isIdentifierUsed)
      return left(new ResourceAlreadyRegisteredError("O ID já utilizado"));

    const isProjectIdUsed = physicaldocumentSearch.find(
      (item) => item.projectId.toString() === project.id.toString()
    );

    if (isProjectIdUsed)
      return left(new ResourceAlreadyRegisteredError("O Projeto já tem ID"));

    const physicalDocument = PhysicalDocument.create({
      projectId: project.id,
      identifier,
      baseId: new UniqueEntityID(baseId),
    });

    await this.physicaldocumentRepository.create(physicalDocument);

    return right({ physicalDocument });
  }
}
