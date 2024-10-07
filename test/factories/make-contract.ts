import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import {
  Contract,
  ContractProps,
} from "../../src/domain/material-movimentation/enterprise/entities/contract";
import { faker } from "@faker-js/faker";
import { BqContractMapper } from "src/infra/database/bigquery/mappers/bq-contract-mapper";
import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export function makeContract(
  override: Partial<ContractProps> = {},
  id?: UniqueEntityID
) {
  const contract = Contract.create(
    {
      contractName: faker.location.city(),
      ...override,
    },
    id
  );

  return contract;
}

@Injectable()
export class ContractFactory {
  constructor(private bigquery: BigQueryService) {}

  async makeBqContract(data: Partial<ContractProps> = {}): Promise<Contract> {
    const contract = makeContract(data);

    await this.bigquery.contract.create([
      BqContractMapper.toBigquery(contract),
    ]);

    return contract;
  }
}
