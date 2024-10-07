import { BudgetWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/budget-with-details";

export class BudgetWithDetailsPresenter {
  static toHTTP(budget: BudgetWithDetails) {
    return {
      id: budget.budgetId.toString(),
      createdAt: budget.createdAt,
      value: budget.value,
      updatedAt: budget.updatedAt,
      updatedAuthor:
        budget.updatedAuthor === undefined
          ? undefined
          : {
              id: budget.updatedAuthor.id.toString(),
              name: budget.updatedAuthor.name,
              email: budget.updatedAuthor.email,
            },
      contract: {
        id: budget.contract.id.toString(),
        contractName: budget.contract.contractName,
      },
      user: {
        id: budget.estimator.id.toString(),
        name: budget.estimator.name,
        email: budget.estimator.email,
      },
      project: {
        id: budget.project.id.toString(),
        project_number: budget.project.project_number,
        description: budget.project.description,
        city: budget.project.city,
      },
      material: {
        id: budget.material.id.toString(),
        code: budget.material.code,
        description: budget.material.description,
        unit: budget.material.unit,
        type: budget.material.type,
      },
    };
  }
}
