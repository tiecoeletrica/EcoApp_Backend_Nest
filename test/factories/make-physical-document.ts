import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "../../src/core/entities/unique-entity-id";
import {
  PhysicalDocument,
  PhysicalDocumentProps,
} from "../../src/domain/material-movimentation/enterprise/entities/physical-document";
import { faker } from "@faker-js/faker";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { BqPhysicalDocumentMapper } from "src/infra/database/bigquery/mappers/bq-physical-document-mapper";

export function makePhysicalDocument(
  override: Partial<PhysicalDocumentProps> = {},
  id?: UniqueEntityID
) {
  const physicaldocument = PhysicalDocument.create(
    {
      projectId: new UniqueEntityID(),
      identifier: faker.number.int({ min: 1, max: 420 }),
      unitized: faker.datatype.boolean(),
      ...override,
    },
    id
  );

  return physicaldocument;
}

@Injectable()
export class PhysicalDocumentFactory {
  constructor(private bigquery: BigQueryService) {}

  async makeBqPhysicalDocument(
    data: Partial<PhysicalDocumentProps> = {}
  ): Promise<PhysicalDocument> {
    const physicaldocument = makePhysicalDocument(data);

    await this.bigquery.physicalDocument.create([
      BqPhysicalDocumentMapper.toBigquery(physicaldocument),
    ]);

    return physicaldocument;
  }
}
