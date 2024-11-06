import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { MovimentationRepository } from "../../repositories/movimentation-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { MovimentationWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/movimentation-with-details";
import { ProjectRepository } from "../../repositories/project-repository";
import { UserRepository } from "../../repositories/user-repository";
import { MaterialRepository } from "../../repositories/material-repository";

interface FetchAllMovimentationHistoryUseCaseRequest {
  baseId: string;
  name?: string;
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

  async *execute({
    baseId,
    name,
    project_number,
    material_code,
    startDate,
    endDate,
  }: FetchAllMovimentationHistoryUseCaseRequest): AsyncGenerator<
    FetchAllMovimentationHistoryUseCaseResponse,
    void,
    unknown
  > {
    let storekeeperIds;
    let projectId;
    let materialId;

    if (name) {
      const storekeepers = await this.userRepository.findManyByName(name);
      if (!storekeepers) {
        yield left(new ResourceNotFoundError(`Nome ${name} não cadastrado`));
        return;
      }
      storekeeperIds = storekeepers.map((storekeeper) =>
        storekeeper.id.toString()
      );
    }

    if (project_number) {
      const project =
        await this.projectRepository.findByProjectNumberWithoutBase(
          project_number
        );
      if (!project) {
        yield left(
          new ResourceNotFoundError(`Projeto ${project_number} não cadastrado`)
        );
        return;
      }
      projectId = project.id.toString();
    }

    if (material_code) {
      const material = await this.materialRepository.findByCodeWithoutContract(
        material_code
      );
      if (!material) {
        yield left(
          new ResourceNotFoundError(`Material ${material_code} não cadastrado`)
        );
        return;
      }
      materialId = material.id.toString();
    }

    for await (const movimentations of this.movimentationRepository.findManyAllHistoryWithDetailsStream(
      baseId,
      storekeeperIds,
      projectId,
      materialId,
      startDate,
      endDate
    )) {
      if (!movimentations.length) {
        yield left(
          new ResourceNotFoundError(
            "Nenhuma movimentação encontrada com esses parâmetros"
          )
        );
        return;
      }

      yield right({ movimentations });
    }
  }
}
