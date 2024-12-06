import { StagingWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/staging-with-details";
import {
  PaginationParams,
  PaginationParamsResponse,
} from "../../src/core/repositories/pagination-params";
import { StagingRepository } from "../../src/domain/material-movimentation/application/repositories/staging-repository";
import { Staging } from "../../src/domain/material-movimentation/enterprise/entities/staging";
import { InMemoryUserRepository } from "./in-memory-user-repository";
import { InMemoryProjectRepository } from "./in-memory-project-repository";
import { InMemoryBaseRepository } from "./in-memory-base-repository";

export class InMemoryStagingRepository implements StagingRepository {
  public items: Staging[] = [];

  constructor(
    private userRepository: InMemoryUserRepository,
    private projectRepository: InMemoryProjectRepository,
    private baseRepository: InMemoryBaseRepository
  ) {}

  async create(staging: Staging) {
    this.items.push(staging);
  }

  async findLastIdentifierByBaseId(baseId: string) {
    return this.items.filter((item) => item.baseId.toString() === baseId)
      .length;
  }

  async findByIds(stagingIds: string[]): Promise<Staging[]> {
    const staging = this.items.filter((item) =>
      stagingIds.includes(item.id.toString())
    );

    return staging;
  }
  async findManyWithDetails(
    { page }: PaginationParams,
    baseId: string,
    projectId?: string,
    supervisorIds?: string[],
    startDate?: Date,
    endDate?: Date,
    identifier?: string
  ): Promise<{
    stagings: StagingWithDetails[];
    pagination: PaginationParamsResponse;
  }> {
    const pageCount = 40;

    const stagings = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .filter((staging) => staging.baseId.toString() === baseId)
      .filter(
        (staging) => !projectId || staging.projectId.toString() === projectId
      )
      .filter(
        (staging) =>
          !supervisorIds ||
          supervisorIds.includes(staging.supervisorId.toString())
      )
      .filter((staging) => !startDate || staging.createdAt >= startDate)
      .filter((staging) => !endDate || staging.createdAt <= endDate)
      .filter((staging) => !identifier || staging.identifier === identifier)
      .slice((page - 1) * pageCount, page * pageCount)
      .map((staging) => {
        const base = this.baseRepository.items.find(
          (base) => base.id === staging.baseId
        );

        if (!base) {
          throw new Error(`base ${staging.baseId} does not exist.`);
        }

        const project = this.projectRepository.items.find(
          (project) => project.id === staging.projectId
        );

        if (!project) {
          throw new Error(`project ${staging.projectId} does not exist.`);
        }

        const supervisor = this.userRepository.items.find(
          (supervisor) => supervisor.id === staging.supervisorId
        );

        if (!supervisor) {
          throw new Error(`supervisor ${staging.supervisorId} does not exist.`);
        }

        return StagingWithDetails.create({
          stagingId: staging.id,
          supervisor,
          base,
          type: staging.type,
          project,
          lootDate: staging.lootDate,
          observation: staging.observation,
          origin: staging.origin,
          transport: staging.transport,
          delivery: staging.delivery,
          createdAt: staging.createdAt,
          identifier: staging.identifier,
          stage: staging.stage,
        });
      });

    const total_count = this.items.length;

    const pagination: PaginationParamsResponse = {
      page,
      pageCount,
      lastPage: Math.ceil(total_count / pageCount),
    };

    return { stagings, pagination };
  }
  //   async findByStagingName(stagingName: string): Promise<Staging | null> {
  //     const staging = this.items.find((item) => item.stagingName === stagingName);

  //     if (!staging) return null;

  //     return staging;
  //   }

  //   async findManyByContractId(contractId: string): Promise<Staging[]> {
  //     const stagings = this.items.filter(
  //       (item) => item.contractId.toString() === contractId
  //     );

  //     return stagings;
  //   }

  //   async findById(stagingId: string): Promise<Staging | null> {
  //     const staging = this.items.find((item) => item.id.toString() === stagingId);

  //     if (!staging) return null;

  //     return staging;
  //   }

  //   async findMany({ page }: PaginationParams): Promise<Staging[]> {
  //     const stagings = this.items
  //       .sort((a, b) => a.stagingName.localeCompare(b.stagingName))
  //       .slice((page - 1) * 40, page * 40);

  //     return stagings;
  //   }
}
