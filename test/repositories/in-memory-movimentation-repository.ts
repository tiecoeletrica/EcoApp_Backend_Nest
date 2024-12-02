import { MovimentationWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/movimentation-with-details";
import {
  PaginationParams,
  PaginationParamsResponse,
} from "../../src/core/repositories/pagination-params";
import { MovimentationRepository } from "../../src/domain/material-movimentation/application/repositories/movimentation-repository";
import { Movimentation } from "../../src/domain/material-movimentation/enterprise/entities/movimentation";
import { InMemoryUserRepository } from "./in-memory-user-repository";
import { InMemoryMaterialRepository } from "./in-memory-material-repository";
import { InMemoryProjectRepository } from "./in-memory-project-repository";
import { InMemoryBaseRepository } from "./in-memory-base-repository";

export class InMemoryMovimentationRepository
  implements MovimentationRepository
{
  public items: Movimentation[] = [];

  constructor(
    private userRepository: InMemoryUserRepository,
    private materialRepository: InMemoryMaterialRepository,
    private projectRepository: InMemoryProjectRepository,
    private baseRepository: InMemoryBaseRepository
  ) {}

  async findByProject(
    projectid: string,
    materialId?: string
  ): Promise<Movimentation[]> {
    const movimentations = this.items
      .filter(
        (movimentation) => movimentation.projectId.toString() === projectid
      )
      .filter(
        (movimentation) =>
          !materialId || movimentation.materialId.toString() === materialId
      );

    return movimentations;
  }

  async findByProjectWithDetails(
    projectid: string,
    baseId: string,
    materialId?: string,
    inicialDate?: Date,
    endDate?: Date
  ): Promise<MovimentationWithDetails[]> {
    const movimentations = this.items
      .filter(
        (movimentation) =>
          movimentation.projectId.toString() === projectid &&
          movimentation.baseId.toString() === baseId
      )
      .filter(
        (movimentation) =>
          !materialId || movimentation.materialId.toString() === materialId
      )
      .filter(
        (movimentation) =>
          !inicialDate || movimentation.createdAt >= inicialDate
      )
      .filter((movimentation) => !endDate || movimentation.createdAt <= endDate)
      .map((movimentation) => {
        const storekeeper = this.userRepository.items.find(
          (storekeeper) => storekeeper.id === movimentation.storekeeperId
        );
        if (!storekeeper) {
          throw new Error(
            `storekeeper ${movimentation.storekeeperId} does not exist.`
          );
        }
        const project = this.projectRepository.items.find(
          (project) => project.id === movimentation.projectId
        );
        if (!project) {
          throw new Error(`project ${movimentation.projectId} does not exist.`);
        }
        const base = this.baseRepository.items.find(
          (base) => base.id === movimentation.baseId
        );
        if (!base) {
          throw new Error(`base ${movimentation.baseId} does not exist.`);
        }
        const material = this.materialRepository.items.find(
          (material) => material.id === movimentation.materialId
        );
        if (!material) {
          throw new Error(
            `material ${movimentation.materialId} does not exist.`
          );
        }

        return MovimentationWithDetails.create({
          movimentationId: movimentation.id,
          value: movimentation.value,
          createdAt: movimentation.createdAt,
          observation: movimentation.observation,
          storekeeper,
          material,
          project,
          base,
        });
      })
      .sort((a, b) => a.material.code - b.material.code);

    return movimentations;
  }

  async findManyHistory(
    { page }: PaginationParams,
    baseId: string,
    storekeeperId?: string,
    projectId?: string,
    materialId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Movimentation[]> {
    const movimentations = this.items
      .filter((movimentation) => movimentation.baseId.toString() === baseId)
      .filter(
        (movimentation) =>
          !materialId || movimentation.materialId.toString() === materialId
      )
      .filter(
        (movimentation) =>
          !storekeeperId ||
          movimentation.storekeeperId.toString() === storekeeperId
      )
      .filter(
        (movimentation) =>
          !projectId || movimentation.projectId.toString() === projectId
      )
      .filter(
        (movimentation) => !startDate || movimentation.createdAt >= startDate
      )
      .filter((movimentation) => !endDate || movimentation.createdAt <= endDate)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 40, page * 40);

    return movimentations;
  }

  async findManyHistoryWithDetails(
    { page }: PaginationParams,
    baseId: string,
    storekeeperIds?: string[],
    projectId?: string,
    materialId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    movimentations: MovimentationWithDetails[];
    pagination: PaginationParamsResponse;
  }> {
    const pageCount = 40;

    const movimentations = this.items
      .filter((movimentation) => movimentation.baseId.toString() === baseId)
      .filter(
        (movimentation) =>
          !materialId || movimentation.materialId.toString() === materialId
      )
      .filter(
        (movimentation) =>
          !storekeeperIds ||
          storekeeperIds.includes(movimentation.storekeeperId.toString())
      )
      .filter(
        (movimentation) =>
          !projectId || movimentation.projectId.toString() === projectId
      )
      .filter(
        (movimentation) => !startDate || movimentation.createdAt >= startDate
      )
      .filter((movimentation) => !endDate || movimentation.createdAt <= endDate)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * pageCount, page * pageCount)
      .map((movimentation) => {
        const storekeeper = this.userRepository.items.find(
          (storekeeper) => storekeeper.id === movimentation.storekeeperId
        );
        if (!storekeeper) {
          throw new Error(
            `storekeeper ${movimentation.storekeeperId} does not exist.`
          );
        }
        const project = this.projectRepository.items.find(
          (project) => project.id === movimentation.projectId
        );
        if (!project) {
          throw new Error(`project ${movimentation.projectId} does not exist.`);
        }
        const base = this.baseRepository.items.find(
          (base) => base.id === movimentation.baseId
        );
        if (!base) {
          throw new Error(`base ${movimentation.baseId} does not exist.`);
        }
        const material = this.materialRepository.items.find(
          (material) => material.id === movimentation.materialId
        );
        if (!material) {
          throw new Error(
            `material ${movimentation.materialId} does not exist.`
          );
        }

        return MovimentationWithDetails.create({
          movimentationId: movimentation.id,
          value: movimentation.value,
          createdAt: movimentation.createdAt,
          observation: movimentation.observation,
          storekeeper,
          material,
          project,
          base,
        });
      });

    const total_count = this.items
      .filter((movimentation) => movimentation.baseId.toString() === baseId)
      .filter(
        (movimentation) =>
          !materialId || movimentation.materialId.toString() === materialId
      )
      .filter(
        (movimentation) =>
          !storekeeperIds ||
          storekeeperIds.includes(movimentation.storekeeperId.toString())
      )
      .filter(
        (movimentation) =>
          !projectId || movimentation.projectId.toString() === projectId
      )
      .filter(
        (movimentation) => !startDate || movimentation.createdAt >= startDate
      )
      .filter(
        (movimentation) => !endDate || movimentation.createdAt <= endDate
      ).length;

    const pagination: PaginationParamsResponse = {
      page,
      pageCount,
      lastPage: Math.ceil(total_count / pageCount),
    };

    return { movimentations, pagination };
  }

  async *findManyAllHistoryWithDetailsStream(
    baseId: string,
    storekeeperIds?: string[],
    projectId?: string,
    materialId?: string,
    startDate?: Date,
    endDate?: Date
  ): AsyncGenerator<MovimentationWithDetails[]> {
    let page = 0;
    const pageCount = 100;

    while (true) {
      const movimentations = this.items
        .filter((movimentation) => movimentation.baseId.toString() === baseId)
        .filter(
          (movimentation) =>
            !materialId || movimentation.materialId.toString() === materialId
        )
        .filter(
          (movimentation) =>
            !storekeeperIds ||
            storekeeperIds.includes(movimentation.storekeeperId.toString())
        )
        .filter(
          (movimentation) =>
            !projectId || movimentation.projectId.toString() === projectId
        )
        .filter(
          (movimentation) => !startDate || movimentation.createdAt >= startDate
        )
        .filter(
          (movimentation) => !endDate || movimentation.createdAt <= endDate
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice((page - 1) * pageCount, page * pageCount)
        .map((movimentation) => {
          const storekeeper = this.userRepository.items.find(
            (storekeeper) => storekeeper.id === movimentation.storekeeperId
          );
          if (!storekeeper) {
            throw new Error(
              `storekeeper ${movimentation.storekeeperId} does not exist.`
            );
          }
          const project = this.projectRepository.items.find(
            (project) => project.id === movimentation.projectId
          );
          if (!project) {
            throw new Error(
              `project ${movimentation.projectId} does not exist.`
            );
          }
          const base = this.baseRepository.items.find(
            (base) => base.id === movimentation.baseId
          );
          if (!base) {
            throw new Error(`base ${movimentation.baseId} does not exist.`);
          }
          const material = this.materialRepository.items.find(
            (material) => material.id === movimentation.materialId
          );
          if (!material) {
            throw new Error(
              `material ${movimentation.materialId} does not exist.`
            );
          }

          return MovimentationWithDetails.create({
            movimentationId: movimentation.id,
            value: movimentation.value,
            createdAt: movimentation.createdAt,
            observation: movimentation.observation,
            storekeeper,
            material,
            project,
            base,
          });
        });

      if (movimentations.length === 0) break;

      yield movimentations;
      page++;
    }
  }

  async create(movimentations: Movimentation[]) {
    movimentations.map((movimentation) => this.items.push(movimentation));
  }
}
