import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { MovimentationRepository } from "../../repositories/movimentation-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { MovimentationWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/movimentation-with-details";
import { ProjectRepository } from "../../repositories/project-repository";
import { UserRepository } from "../../repositories/user-repository";
import { MaterialRepository } from "../../repositories/material-repository";
import { PaginationParamsResponse } from "src/core/repositories/pagination-params";

interface FetchAllMovimentationHistoryUseCaseRequest {
  baseId: string;
  email?: string;
  project_number?: string;
  material_code?: number;
  startDate?: Date;
  endDate?: Date;
}

type FetchAllMovimentationHistoryUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    movimentations: MovimentationWithDetails[];
  }
>;

@Injectable()
export class FetchAllMovimentationHistoryUseCase {
  constructor(
    private movimentationRepository: MovimentationRepository,
    private projectRepository: ProjectRepository,
    private userRepository: UserRepository,
    private materialRepository: MaterialRepository
  ) {}

  async execute({
    baseId,
    email,
    project_number,
    material_code,
    startDate,
    endDate,
  }: FetchAllMovimentationHistoryUseCaseRequest): Promise<FetchAllMovimentationHistoryUseCaseResponse> {
    let storekeeperId;
    let projectId;
    let materialId;

    if (email) {
      const storekeeper = await this.userRepository.findByEmail(email);
      if (!storekeeper)
        return left(new ResourceNotFoundError("email  não encontrado"));
      storekeeperId = storekeeper.id.toString();
    }

    if (project_number) {
      const project =
        await this.projectRepository.findByProjectNumberWithoutBase(
          project_number
        );
      if (!project)
        return left(new ResourceNotFoundError("project_number não encontrado"));
      projectId = project.id.toString();
    }

    if (material_code) {
      const material = await this.materialRepository.findByCodeWithoutContract(
        material_code
      );
      if (!material)
        return left(new ResourceNotFoundError("material_code não encontrado"));
      materialId = material.id.toString();
    }

    const movimentations =
      await this.movimentationRepository.findManyAllHistoryWithDetails(
        baseId,
        storekeeperId,
        projectId,
        materialId,
        startDate,
        endDate
      );

    if (!movimentations.length) return left(new ResourceNotFoundError());

    return right({ movimentations });
  }
}
