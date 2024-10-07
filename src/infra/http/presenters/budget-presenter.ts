import { Budget } from "src/domain/material-movimentation/enterprise/entities/budget";

export class BudgetPresenter {
  static toHTTP(budget: Budget) {
    return {
      id: budget.id.toString(),
      contractId: budget.contractId.toString(),
      userId: budget.estimatorId.toString(),
      projectId: budget.projectId.toString(),
      materialId: budget.materialId.toString(),
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
      updatedAuthorId: budget.updatedAuthorId,
      value: budget.value,
    };
  }
}
