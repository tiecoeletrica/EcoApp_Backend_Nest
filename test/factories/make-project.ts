import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { UniqueEntityID } from "../../src/core/entities/unique-entity-id";
import {
  Project,
  ProjectProps,
} from "../../src/domain/material-movimentation/enterprise/entities/project";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { BqProjectMapper } from "src/infra/database/bigquery/mappers/bq-project-mapper";

export function makeProject(
  override: Partial<ProjectProps> = {},
  id?: UniqueEntityID
) {
  const project = Project.create(
    {
      project_number: faker.lorem.word().toUpperCase(),
      description: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(types),
      baseId: new UniqueEntityID(),
      city: faker.location.city(),
      ...override,
    },
    id
  );

  return project;
}

@Injectable()
export class ProjectFactory {
  constructor(private bigquery: BigQueryService) {}

  async makeBqProject(data: Partial<ProjectProps> = {}): Promise<Project> {
    const project = makeProject(data);

    await this.bigquery.project.create([BqProjectMapper.toBigquery(project)]);

    return project;
  }
}

const types = ["Obra", "OC", "OS", "Kit", "Medidor"];
