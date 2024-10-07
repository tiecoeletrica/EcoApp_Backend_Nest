import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { UniqueEntityID } from "../../src/core/entities/unique-entity-id";
import {
  Movimentation,
  MovimentationProps,
} from "../../src/domain/material-movimentation/enterprise/entities/movimentation";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { BqMovimentationMapper } from "src/infra/database/bigquery/mappers/bq-movimentation-mapper";

export function makeMovimentation(
  override: Partial<MovimentationProps> = {},
  id?: UniqueEntityID
) {
  const movimentation = Movimentation.create(
    {
      projectId: new UniqueEntityID(),
      materialId: new UniqueEntityID(),
      storekeeperId: new UniqueEntityID(),
      baseId: new UniqueEntityID(),
      observation: faker.lorem.sentence(),
      value: faker.number.float({ min: -1000, max: 1000 }),
      createdAt: faker.date.recent(),
      ...override,
    },
    id
  );

  return movimentation;
}

@Injectable()
export class MovimentationFactory {
  constructor(private bigquery: BigQueryService) {}

  async makeBqMovimentation(
    data: Partial<MovimentationProps> = {}
  ): Promise<Movimentation> {
    const movimentation = makeMovimentation(data);

    await this.bigquery.movimentation.create([
      BqMovimentationMapper.toBigquery(movimentation),
    ]);

    return movimentation;
  }
}
