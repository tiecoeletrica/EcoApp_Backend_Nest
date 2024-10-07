import { Budget } from "src/domain/material-movimentation/enterprise/entities/budget";
import { BqBudgetProps } from "../schemas/budget";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export class BqBudgetMapper {
  static toDomain(raw: BqBudgetProps): Budget {
    return Budget.create(
      {
        projectId: new UniqueEntityID(raw.projectId),
        contractId: new UniqueEntityID(raw.contractId),
        estimatorId: new UniqueEntityID(raw.userId),
        materialId: new UniqueEntityID(raw.materialId),
        createdAt: raw.createdAt,
        value: raw.value,
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toBigquery(budget: Budget): BqBudgetProps {
    return {
      id: budget.id.toString(),
      projectId: budget.projectId.toString(),
      contractId: budget.contractId.toString(),
      userId: budget.estimatorId.toString(),
      materialId: budget.materialId.toString(),
      createdAt: budget.createdAt,
      value: budget.value,
      updatedAt: budget.updatedAt,
      updatedAuthorId: budget.updatedAuthorId?.toString(),
    };
  }
}
