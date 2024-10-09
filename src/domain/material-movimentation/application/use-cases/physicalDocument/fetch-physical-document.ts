import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { PhysicalDocumentRepository } from "../../repositories/physical-document-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { PhysicalDocumentWithProject } from "src/domain/material-movimentation/enterprise/entities/value-objects/physical-document-with-project";
import { ProjectRepository } from "../../repositories/project-repository";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { PaginationParamsResponse } from "src/core/repositories/pagination-params";

interface FetchPhysicalDocumentUseCaseRequest {
  page: number;
  baseId: string;
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
    identifier,
    project_number,
    unitized
  }: FetchPhysicalDocumentUseCaseRequest): Promise<FetchPhysicalDocumentUseCaseResponse> {
    let project: Project | null = null;

    if (project_number) {
      project = await this.projectRepository.findByProjectNumber(
        project_number,
        baseId
      );
      if (!project)
        return left(new ResourceNotFoundError("Projeto não encontrado"));
    }

    const { physicalDocuments, pagination } =
      await this.physicaldocumentRepository.findManyWithProject(
        {
          page,
        },
        baseId,
        identifier,
        project === null ? undefined : project?.id.toString(),
        unitized
      );

    if (!physicalDocuments.length)
      return left(new ResourceNotFoundError("Pesquisa sem resultados"));

    return right({ physicalDocuments, pagination });
  }
}
