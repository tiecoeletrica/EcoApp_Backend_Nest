import { BaseWithContract } from "src/domain/material-movimentation/enterprise/entities/value-objects/base-with-contract";
import {
  PaginationParams,
  PaginationParamsResponse,
} from "../../src/core/repositories/pagination-params";
import { BaseRepository } from "../../src/domain/material-movimentation/application/repositories/base-repository";
import { Base } from "../../src/domain/material-movimentation/enterprise/entities/base";
import { InMemoryContractRepository } from "./in-memory-contract-repository";

export class InMemoryBaseRepository implements BaseRepository {
  public items: Base[] = [];

  constructor(private contractRepository: InMemoryContractRepository) {}

  async findByBaseName(baseName: string): Promise<Base | null> {
    const base = this.items.find((item) => item.baseName === baseName);

    if (!base) return null;

    return base;
  }

  async findManyByContractId(contractId: string): Promise<Base[]> {
    const bases = this.items.filter(
      (item) => item.contractId.toString() === contractId
    );

    return bases;
  }

  async findById(baseId: string): Promise<Base | null> {
    const base = this.items.find((item) => item.id.toString() === baseId);

    if (!base) return null;

    return base;
  }

  async findByIds(baseIds: string[]): Promise<Base[]> {
    const base = this.items.filter((item) =>
      baseIds.includes(item.id.toString())
    );

    return base;
  }

  async create(base: Base) {
    this.items.push(base);
  }

  async findMany({ page }: PaginationParams): Promise<Base[]> {
    const bases = this.items
      .sort((a, b) => a.baseName.localeCompare(b.baseName))
      .slice((page - 1) * 40, page * 40);

    return bases;
  }

  async findManyWithContract({ page }: PaginationParams): Promise<{
    bases: BaseWithContract[];
    pagination: PaginationParamsResponse;
  }> {
    const pageCount = 40;

    const bases = this.items
      .sort((a, b) => a.baseName.localeCompare(b.baseName))
      .slice((page - 1) * pageCount, page * pageCount)
      .map((base) => {
        const contract = this.contractRepository.items.find(
          (contract) => contract.id === base.contractId
        );

        if (!contract) {
          throw new Error(`contract ${base.contractId} does not exist.`);
        }

        return BaseWithContract.create({
          baseId: base.id,
          baseName: base.baseName,
          contract,
        });
      });

    const total_count = this.items.length;

    const pagination: PaginationParamsResponse = {
      page,
      pageCount,
      lastPage: Math.ceil(total_count / pageCount),
    };

    return { bases, pagination };
  }
}
