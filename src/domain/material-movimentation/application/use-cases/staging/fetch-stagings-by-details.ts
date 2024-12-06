import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { StagingRepository } from "../../repositories/staging-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { StagingWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/staging-with-details";
import { PaginationParamsResponse } from "src/core/repositories/pagination-params";
import { Base } from "src/domain/material-movimentation/enterprise/entities/base";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { UserEntities } from "src/core/types/user-type";
import { BaseRepository } from "../../repositories/base-repository";
import { ProjectRepository } from "../../repositories/project-repository";
import { UserRepository } from "../../repositories/user-repository";

interface FetchStagingUseCaseRequest {
  page: number;
  baseId: string;
  supervisorName?: string;
  project_number?: string;
  startDate?: Date;
  endDate?: Date;
  identifier?: string;
}

type FetchStagingUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    stagings: StagingWithDetails[];
    pagination: PaginationParamsResponse;
  }
>;

type FindIdsForSearchResponse = Eihter<
  ResourceNotFoundError,
  {
    base: Base;
    project?: Project;
    supervisors?: UserEntities[];
  }
>;

@Injectable()
export class FetchStagingUseCase {
  constructor(
    private stagingRepository: StagingRepository,
    private baseRepository: BaseRepository,
    private projectRepository: ProjectRepository,
    private userRepository: UserRepository
  ) {}

  async execute({
    page,
    baseId,
    supervisorName,
    project_number,
    startDate,
    endDate,
    identifier,
  }: FetchStagingUseCaseRequest): Promise<FetchStagingUseCaseResponse> {
    const findIdsForSearchResult = await this.findIdsForSearch(
      baseId,
      supervisorName,
      project_number
    );

    if (findIdsForSearchResult.isLeft())
      return left(findIdsForSearchResult.value);
    const { base, project, supervisors } = findIdsForSearchResult.value;

    const { stagings, pagination } =
      await this.stagingRepository.findManyWithDetails(
        {
          page,
        },
        base.id.toString(),
        project?.id.toString(),
        supervisors?.map((sup) => sup.id.toString()),
        startDate,
        endDate,
        identifier
      );

    if (!stagings.length)
      return left(new ResourceNotFoundError("Pesquisa sem resultados"));

    return right({ stagings, pagination });
  }

  private async findIdsForSearch(
    baseId: string,
    supervisorName: string | undefined,
    project_number: string | undefined
  ): Promise<FindIdsForSearchResponse> {
    let supervisors: UserEntities[] | undefined;
    let project: Project | undefined;

    const base = await this.baseRepository.findById(baseId);
    if (!base) {
      return left(
        new ResourceNotFoundError(`Base de id "${baseId}" não encontrado`)
      );
    }

    if (supervisorName) {
      supervisors = await this.userRepository.findManyByName(supervisorName);
      if (!supervisors) {
        return left(
          new ResourceNotFoundError(`Nome ${supervisorName} não cadastrado`)
        );
      }
    }

    if (project_number) {
      project =
        (await this.projectRepository.findByProjectNumberAndContractId(
          project_number,
          base.contractId.toString()
        )) ?? undefined;
      if (!project) {
        return left(
          new ResourceNotFoundError(`Projeto ${project_number} não cadastrado`)
        );
      }
    }

    return right({ base, project, supervisors });
  }
}
