import {
  PaginationParams,
  PaginationParamsResponse,
} from "../../src/core/repositories/pagination-params";
import { StagingRepository } from "../../src/domain/material-movimentation/application/repositories/staging-repository";
import { Staging } from "../../src/domain/material-movimentation/enterprise/entities/staging";
import { InMemoryContractRepository } from "./in-memory-contract-repository";

export class InMemoryStagingRepository implements StagingRepository {
  public items: Staging[] = [];

  constructor(private contractRepository: InMemoryContractRepository) {}

  async create(staging: Staging) {
    this.items.push(staging);
  }

  async findLastIdentifierByBaseId(baseId: string) {
    return this.items.filter((item) => item.baseId.toString() === baseId)
      .length;
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

  //   async findByIds(stagingIds: string[]): Promise<Staging[]> {
  //     const staging = this.items.filter((item) =>
  //       stagingIds.includes(item.id.toString())
  //     );

  //     return staging;
  //   }

  //   async findMany({ page }: PaginationParams): Promise<Staging[]> {
  //     const stagings = this.items
  //       .sort((a, b) => a.stagingName.localeCompare(b.stagingName))
  //       .slice((page - 1) * 40, page * 40);

  //     return stagings;
  //   }

  //   async findManyWithContract({ page }: PaginationParams): Promise<{
  //     stagings: StagingWithContract[];
  //     pagination: PaginationParamsResponse;
  //   }> {
  //     const pageCount = 40;

  //     const stagings = this.items
  //       .sort((a, b) => a.stagingName.localeCompare(b.stagingName))
  //       .slice((page - 1) * pageCount, page * pageCount)
  //       .map((staging) => {
  //         const contract = this.contractRepository.items.find(
  //           (contract) => contract.id === staging.contractId
  //         );

  //         if (!contract) {
  //           throw new Error(`contract ${staging.contractId} does not exist.`);
  //         }

  //         return StagingWithContract.create({
  //           stagingId: staging.id,
  //           stagingName: staging.stagingName,
  //           contract,
  //         });
  //       });

  //     const total_count = this.items.length;

  //     const pagination: PaginationParamsResponse = {
  //       page,
  //       pageCount,
  //       lastPage: Math.ceil(total_count / pageCount),
  //     };

  //     return { stagings, pagination };
  //   }
}
