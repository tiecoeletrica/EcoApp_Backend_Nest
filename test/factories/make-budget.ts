import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "../../src/core/entities/unique-entity-id";
import {
  Budget,
  BudgetProps,
} from "../../src/domain/material-movimentation/enterprise/entities/budget";
import { faker } from "@faker-js/faker";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { BqBudgetMapper } from "src/infra/database/bigquery/mappers/bq-budget-mapper";

export function makeBudget(
  override: Partial<BudgetProps> = {},
  id?: UniqueEntityID
) {
  const budget = Budget.create(
    {
      projectId: new UniqueEntityID(),
      materialId: new UniqueEntityID(),
      estimatorId: new UniqueEntityID(),
      contractId: new UniqueEntityID(),
      value: faker.number.float({ min: -1000, max: 1000 }),
      createdAt: faker.date.recent(),
      ...override,
    },
    id
  );

  return budget;
}

@Injectable()
export class BudgetFactory {
  constructor(private bigquery: BigQueryService) {}

  async makeBqBudget(data: Partial<BudgetProps> = {}): Promise<Budget> {
    const budget = makeBudget(data);

    await this.bigquery.budget.create([BqBudgetMapper.toBigquery(budget)]);

    return budget;
  }
}
