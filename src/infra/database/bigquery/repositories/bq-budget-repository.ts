import { Injectable } from "@nestjs/common";
import { BudgetRepository } from "src/domain/material-movimentation/application/repositories/budget-repository";
import { Budget } from "src/domain/material-movimentation/enterprise/entities/budget";
import { BigQueryService } from "../bigquery.service";
import { BqBudgetMapper } from "../mappers/bq-budget-mapper";
import { BudgetWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/budget-with-details";
import { BqBudgetWithDetailsMapper } from "../mappers/bq-budget-with-details-mapper";

@Injectable()
export class BqBudgetRepository implements BudgetRepository {
  constructor(private bigquery: BigQueryService) {}

  async findByProject(projectId: string): Promise<Budget[]> {
    const budgets = await this.bigquery.budget.select({
      where: { projectId },
    });

    const budgetsMapped = budgets.map(BqBudgetMapper.toDomain);

    return budgetsMapped;
  }

  async findByProjectWithDetails(
    projectId: string,
    contractId: string,
    inicialDate?: Date,
    endDate?: Date
  ): Promise<BudgetWithDetails[]> {
    const budgets = await this.bigquery.budget.select({
      where: { projectId, contractId },
      greaterOrEqualThan: { createdAt: inicialDate },
      lessOrEqualThan: { createdAt: endDate },
      orderBy: { column: "material.code", direction: "ASC" },
      include: {
        project: {
          join: {
            table: "project",
            on: "budget.projectId = project.id",
          },
          relationType: "one-to-one",
        },
        contract: {
          join: {
            table: "contract",
            on: "budget.contractId = contract.id",
          },
          relationType: "one-to-one",
        },
        user: {
          join: {
            table: "user",
            on: "budget.userId = user.id",
          },
          relationType: "one-to-one",
        },
        material: {
          join: {
            table: "material",
            on: "budget.materialId = material.id",
          },
          relationType: "one-to-one",
        },
        updatedAuthor: {
          join: {
            table: "user",
            on: "budget.updatedAuthorId = user.id",
          },
          relationType: "one-to-one",
        },
      },
    });

    const budgetsMapped = budgets.map(BqBudgetWithDetailsMapper.toDomain);

    return budgetsMapped;
  }

  async findByProjectIds(
    projectids: string[],
    contractId: string,
    inicialDate?: Date,
    endDate?: Date
  ): Promise<Budget[]> {
    const budgets = await this.bigquery.budget.select({
      distinct: true,
      whereIn: { projectId: projectids },
      where: { contractId },
      greaterOrEqualThan: { createdAt: inicialDate },
      lessOrEqualThan: { createdAt: endDate },
    });

    return budgets.map(BqBudgetMapper.toDomain);
  }

  async findByMaterialIds(
    materialids: string[],
    contractId: string
  ): Promise<Budget[]> {
    const budgets = await this.bigquery.budget.select({
      distinct: true,
      whereIn: { materialId: materialids },
      where: { contractId },
    });

    return budgets.map(BqBudgetMapper.toDomain);
  }

  async *findByProjectIdsWithDetails(
    projectids: string[],
    contractId: string
  ): AsyncGenerator<BudgetWithDetails[]> {
    let page = 0;
    const pageCount = 20000;

    while (true) {
      const budgets = await this.bigquery.budget.select({
        distinct: true,
        whereIn: { projectId: projectids },
        where: { contractId },
        limit: pageCount,
        offset: pageCount * page,
        include: {
          project: {
            join: {
              table: "project",
              on: "budget.projectId = project.id",
            },
            relationType: "one-to-one",
          },
          contract: {
            join: {
              table: "contract",
              on: "budget.contractId = contract.id",
            },
            relationType: "one-to-one",
          },
          user: {
            join: {
              table: "user",
              on: "budget.userId = user.id OR budget.updatedAuthorId = user.id",
            },
            relationType: "one-to-one",
          },
          material: {
            join: {
              table: "material",
              on: "budget.materialId = material.id",
            },
            relationType: "one-to-one",
          },
          updatedAuthor: {
            join: {
              table: "user",
              on: "budget.updatedAuthorId = user.id",
            },
            relationType: "one-to-one",
          },
        },
      });

      if (budgets.length === 0) break;

      yield budgets.map(BqBudgetWithDetailsMapper.toDomain);
      page++;
    }
  }

  async findManyByProjectMaterial(
    projectids: string[],
    contractId: string,
    materialId: string
  ): Promise<Budget[]> {
    const budgets = await this.bigquery.budget.select({
      distinct: true,
      whereIn: { projectId: projectids },
      where: { contractId, materialId },
      greaterOrEqualThan: { value: 0.00001 },
    });

    return budgets.map(BqBudgetMapper.toDomain);
  }

  async create(budgets: Budget[]): Promise<void> {
    const data = budgets.map(BqBudgetMapper.toBigquery);

    await this.bigquery.budget.create(data);
  }

  async findByIds(ids: string[]): Promise<Budget[]> {
    const projects = await this.bigquery.budget.select({
      whereIn: { id: ids },
    });

    return projects.map(BqBudgetMapper.toDomain);
  }

  async save(budget: Budget): Promise<void> {
    await this.bigquery.budget.update({
      data: BqBudgetMapper.toBigquery(budget),
      where: { id: budget.id.toString() },
    });
  }

  async saveBulk(budgets: Budget[]): Promise<void> {
    const arrayToUpdate = budgets.map((budget) => {
      return {
        set: BqBudgetMapper.toBigquery(budget),
        where: { id: budget.id.toString() },
      };
    });

    await this.bigquery.budget.updateBulk({
      updates: arrayToUpdate,
    });
  }
}
