import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { PhysicalDocumentRepository } from "../../repositories/physical-document-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { PhysicalDocumentWithProject } from "src/domain/material-movimentation/enterprise/entities/value-objects/physical-document-with-project";
import { ProjectRepository } from "../../repositories/project-repository";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { PaginationParamsResponse } from "src/core/repositories/pagination-params";

interface FetchPhysicalDocumentUseCaseRequest {
  page: number;
  baseId: string;
  contractId: string;
  project_number?: string;
  identifier?: number;
  unitized?: boolean;
}

type FetchPhysicalDocumentUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    physicalDocuments: PhysicalDocumentWithProject[];
    pagination: PaginationParamsResponse;
  }
>;

@Injectable()
export class FetchPhysicalDocumentUseCase {
  constructor(
    private physicaldocumentRepository: PhysicalDocumentRepository,
    private projectRepository: ProjectRepository
  ) {}

  async execute({
    page,
    baseId,
    contractId,
    identifier,
    project_number,
    unitized,
  }: FetchPhysicalDocumentUseCaseRequest): Promise<FetchPhysicalDocumentUseCaseResponse> {
    let project: Project | null = null;

    if (project_number) {
      project = await this.projectRepository.findByProjectNumberAndContractId(
        project_number,
        contractId
      );
      if (!project)
        return left(
          new ResourceNotFoundError(
            `O projeto ${project_number} não foi encontrado`
          )
        );
    }

    const { physicalDocuments, pagination } =
      await this.physicaldocumentRepository.findManyWithProject(
        {
          page,
        },
        baseId,
        identifier,
        project === null ||
          ["KIT", "MEDIDOR"].includes(project.type.toUpperCase())
          ? undefined
          : project?.id.toString(),
        unitized,
        project === null || project.type.toUpperCase() !== "KIT"
          ? undefined
          : project?.id.toString(),
        project === null || project.type.toUpperCase() !== "MEDIDOR"
          ? undefined
          : project?.id.toString()
      );

    if (!physicalDocuments.length)
      return left(new ResourceNotFoundError("Pesquisa sem resultados"));

    return right({ physicalDocuments, pagination });
  }
}
