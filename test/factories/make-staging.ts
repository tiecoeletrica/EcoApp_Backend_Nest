import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { UniqueEntityID } from "../../src/core/entities/unique-entity-id";
import {
  Staging,
  StagingProps,
} from "../../src/domain/material-movimentation/enterprise/entities/staging";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { StageTypes } from "src/core/types/stage-type";
// import { BqStagingMapper } from "src/infra/database/bigquery/mappers/bq-staging-mapper";

export function makeStaging(
  override: Partial<StagingProps> = {},
  id?: UniqueEntityID
) {
  const type: "FERRAGEM" | "CONCRETO" = faker.helpers.arrayElement([
    "FERRAGEM",
    "CONCRETO",
  ]);

  const transport: "CARRETA" | "SAQUE" = faker.helpers.arrayElement([
    "CARRETA",
    "SAQUE",
  ]);

  const delivery: "OBRA" | "REGIÃO" = faker.helpers.arrayElement([
    "OBRA",
    "REGIÃO",
  ]);

  let stage: StageTypes;

  switch (type + transport) {
    case "CONCRETOSAQUE":
      stage = "AGUARDANDO RETIRADA";
    case "CONCRETOCARRETA":
      stage = "AGUARDANDO PROGRAMAÇÃO";
    default:
      stage = "AGUARDANDO SEPARAÇÃO";
  }

  const staging = Staging.create(
    {
      supervisorId: new UniqueEntityID(),
      baseId: new UniqueEntityID(),
      type,
      projectId: new UniqueEntityID(),
      lootDate: faker.date.soon(),
      observation: faker.lorem.sentence(),
      origin: faker.helpers.arrayElement(["ITENS PARCIAIS", "ORÇAMENTO"]),
      transport: type !== "CONCRETO" ? undefined : transport,
      delivery: type !== "CONCRETO" ? undefined : delivery,
      createdAt: new Date(),
      identifier: faker.lorem.word(),
      stage,
      ...override,
    },
    id
  );

  return staging;
}

// @Injectable()
// export class StagingFactory {
//   constructor(private bigquery: BigQueryService) {}

//   async makeBqStaging(data: Partial<StagingProps> = {}): Promise<Staging> {
//     const staging = makeStaging(data);

//     await this.bigquery.staging.create([BqStagingMapper.toBigquery(staging)]);

//     return staging;
//   }
// }

const types = ["Obra", "OC", "OS", "Kit", "Medidor"];
