import { Injectable } from "@nestjs/common";
import {
  PaginationParams,
  PaginationParamsResponse,
} from "src/core/repositories/pagination-params";
import { ContractRepository } from "src/domain/material-movimentation/application/repositories/contract-repository";
import { Contract } from "src/domain/material-movimentation/enterprise/entities/contract";
import { BigQueryService } from "../bigquery.service";
import { BqContractMapper } from "../mappers/bq-contract-mapper";

@Injectable()
export class BqContractRepository implements ContractRepository {
  constructor(private bigquery: BigQueryService) {}

  async create(contract: Contract): Promise<void> {
    const data = BqContractMapper.toBigquery(contract);

    await this.bigquery.contract.create([data]);
  }

  async findByContractName(contractName: string): Promise<Contract | null> {
    const [contract] = await this.bigquery.contract.select({
      where: { contractName },
    });

    if (!contract) return null;

    return BqContractMapper.toDomain(contract);
  }

  async findById(contractId: string): Promise<Contract | null> {
    const [contract] = await this.bigquery.contract.select({
      where: { id: contractId },
    });

    if (!contract) return null;

    return BqContractMapper.toDomain(contract);
  }

  async findByIds(contractIds: string[]): Promise<Contract[]> {
    const contracts = await this.bigquery.contract.select({
      whereIn: { id: contractIds },
    });

    return contracts.map(BqContractMapper.toDomain);
  }

  async findMany({ page }: PaginationParams): Promise<{
    contracts: Contract[];
    pagination: PaginationParamsResponse;
  }> {
    const pageCount = 40;

    const { results: contracts, total_count } =
      await this.bigquery.contract.select({
        limit: pageCount,
        offset: pageCount * (page - 1),
        count_results: true,
        orderBy: [{ column: "contractName", direction: "ASC" }],
      });

    const pagination: PaginationParamsResponse = {
      page,
      pageCount,
      lastPage: Math.ceil(total_count / pageCount),
    };

    return { contracts: contracts.map(BqContractMapper.toDomain), pagination };
  }
}
