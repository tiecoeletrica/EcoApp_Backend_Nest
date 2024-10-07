import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "../../src/core/entities/unique-entity-id";
import {
  Material,
  MaterialProps,
} from "../../src/domain/material-movimentation/enterprise/entities/material";
import { faker } from "@faker-js/faker";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { BqMaterialMapper } from "src/infra/database/bigquery/mappers/bq-material-mapper";

export function makeMaterial(
  override: Partial<MaterialProps> = {},
  id?: UniqueEntityID
) {
  const material = Material.create(
    {
      code: faker.number.int({ min: 10000, max: 999999 }),
      description: faker.number
        .int({ min: 100000000, max: 10000000000 })
        .toString(),
      unit: faker.helpers.arrayElement(unit),
      type: faker.helpers.arrayElement(types),
      contractId: new UniqueEntityID(),
      ...override,
    },
    id
  );

  return material;
}

@Injectable()
export class MaterialFactory {
  constructor(private bigquery: BigQueryService) {}

  async makeBqMaterial(
    data: Partial<MaterialProps> = {},
    id?: UniqueEntityID
  ): Promise<Material> {
    const material = makeMaterial(data, id);

    await this.bigquery.material.create([
      BqMaterialMapper.toBigquery(material),
    ]);

    return material;
  }
}

const unit = ["CDA", "UN", "M", "KG"];
const types = ["CONCRETO", "FERRAGEM"];
