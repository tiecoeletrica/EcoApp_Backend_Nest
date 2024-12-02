import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { MovimentationRepository } from "../../repositories/movimentation-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { MovimentationWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/movimentation-with-details";
import { ProjectRepository } from "../../repositories/project-repository";
import { UserRepository } from "../../repositories/user-repository";
import { MaterialRepository } from "../../repositories/material-repository";
import { PaginationParamsResponse } from "src/core/repositories/pagination-params";
import { BaseRepository } from "../../repositories/base-repository";

interface FetchMovimentationHistoryUseCaseRequest {
  page: number;
  baseId: string;
  name?: string;
  project_number?: string;
  material_code?: number;
  startDate?: Date;
  endDate?: Date;
}

type FetchMovimentationHistoryUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    movimentations: MovimentationWithDetails[];
    pagination: PaginationParamsResponse;
  }
>;

@Injectable()
export class FetchMovimentationHistoryUseCase {
  constructor(
    private movimentationRepository: MovimentationRepository,
    private projectRepository: ProjectRepository,
    private userRepository: UserRepository,
    private materialRepository: MaterialRepository,
    private baseRepository: BaseRepository
  ) {}

  async execute({
    page,
    baseId,
    name,
    project_number,
    material_code,
    startDate,
    endDate,
  }: FetchMovimentationHistoryUseCaseRequest): Promise<FetchMovimentationHistoryUseCaseResponse> {
    let storekeeperIds: string[] | undefined = undefined,
      projectId: string | undefined = undefined,
      materialId: string | undefined = undefined,
      projectFirstDate: Date | undefined = undefined,
      projectLastDate: Date | undefined = undefined;

    const base = await this.baseRepository.findById(baseId);
    if (!base)
      return left(
        new ResourceNotFoundError(`Base de id "${baseId}" não encontrado`)
      );

    if (name) {
      const storekeepers = await this.userRepository.findManyByName(name);
      if (storekeepers.length < 1)
        return left(new ResourceNotFoundError(`Nome "${name}" não encontrado`));
      storekeeperIds = storekeepers.map((storekeeper) =>
        storekeeper.id.toString()
      );
    }

    if (project_number) {
      const project =
        await this.projectRepository.findByProjectNumberAndContractId(
          project_number,
          base.contractId.toString()
        );
      if (!project)
        return left(
          new ResourceNotFoundError(
            `Projeto "${project_number}" não cadastrado`
          )
        );
      projectFirstDate = project.firstMovimentationRegister;
      projectLastDate = project.lastMovimentationRegister;
      projectId = project.id.toString();
    }

    if (material_code) {
      const material = await this.materialRepository.findByCode(
        material_code,
        base.contractId.toString()
      );
      if (!material)
        return left(
          new ResourceNotFoundError(
            `Material "${material_code}" não cadastrado`
          )
        );
      materialId = material.id.toString();
    }

    if (!name && !project_number && !material_code && !startDate && !endDate && page <= 3) {
      const result = await this.searchRecentHistory(page, baseId);
      if (result.isLeft()) {
        return await this.searchAllHistory(
          page,
          baseId,
          storekeeperIds,
          projectId,
          materialId,
          startDate,
          endDate
        );
      }

      return result;
    } else {
      return await this.searchAllHistory(
        page,
        baseId,
        storekeeperIds,
        projectId,
        materialId,
        startDate ?? projectFirstDate,
        endDate ?? projectLastDate
      );
    }
  }

  private async searchRecentHistory(
    page: number,
    baseId: string
  ): Promise<
    Eihter<
      ResourceNotFoundError,
      {
        movimentations: MovimentationWithDetails[];
        pagination: PaginationParamsResponse;
      }
    >
  > {
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));

    const { movimentations, pagination } =
      await this.movimentationRepository.findManyHistoryWithDetails(
        {
          page,
        },
        baseId,
        undefined,
        undefined,
        undefined,
        lastMonth,
        undefined
      );

    if (!movimentations.length)
      return left(
        new ResourceNotFoundError(
          "Nenhuma movimentação encontrada com esses parâmetros"
        )
      );

    return right({ movimentations, pagination });
  }

  private async searchAllHistory(
    page: number,
    baseId: string,
    storekeeperIds?: string[],
    projectId?: string,
    materialId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<
    Eihter<
      ResourceNotFoundError,
      {
        movimentations: MovimentationWithDetails[];
        pagination: PaginationParamsResponse;
      }
    >
  > {
    const { movimentations, pagination } =
      await this.movimentationRepository.findManyHistoryWithDetails(
        {
          page,
        },
        baseId,
        storekeeperIds,
        projectId,
        materialId,
        startDate,
        endDate
      );

    if (!movimentations.length)
      return left(
        new ResourceNotFoundError(
          "Nenhuma movimentação encontrada com esses parâmetros"
        )
      );

    return right({ movimentations, pagination });
  }
}
