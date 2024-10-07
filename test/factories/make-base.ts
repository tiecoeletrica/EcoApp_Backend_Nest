import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "../../src/core/entities/unique-entity-id";
import {
  Base,
  BaseProps,
} from "../../src/domain/material-movimentation/enterprise/entities/base";
import { faker } from "@faker-js/faker";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { BqBaseMapper } from "src/infra/database/bigquery/mappers/bq-base-mapper";

export function makeBase(
  override: Partial<BaseProps> = {},
  id?: UniqueEntityID
) {
  const base = Base.create(
    {
      contractId: new UniqueEntityID(),
      baseName: faker.location.city(),
      ...override,
    },
    id
  );

  return base;
}

@Injectable()
export class BaseFactory {
  constructor(private bigquery: BigQueryService) {}

  async makeBqBase(data: Partial<BaseProps> = {}): Promise<Base> {
    const base = makeBase(data);

    await this.bigquery.base.create([BqBaseMapper.toBigquery(base)]);

    return base;
  }
}
