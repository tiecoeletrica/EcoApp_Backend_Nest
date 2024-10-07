import { BqBudgetProps } from "../schemas/budget";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { BudgetWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/budget-with-details";
import { Material } from "src/domain/material-movimentation/enterprise/entities/material";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { Estimator } from "src/domain/material-movimentation/enterprise/entities/estimator";
import { Contract } from "src/domain/material-movimentation/enterprise/entities/contract";
import { UserType } from "src/core/types/user-type";

export class BqBudgetWithDetailsMapper {
  static toDomain(raw: BqBudgetProps): BudgetWithDetails {
    let userType: UserType = "Orçamentista";
    if (raw.user?.type && BqBudgetWithDetailsMapper.isUserType(raw.user.type)) {
      userType = raw.user.type;
    }
    let updatedAuthorType: UserType = "Orçamentista";
    if (
      raw.updatedAuthor?.type &&
      BqBudgetWithDetailsMapper.isUserType(raw.updatedAuthor.type)
    ) {
      updatedAuthorType = raw.updatedAuthor.type;
    }
    return BudgetWithDetails.create({
      budgetId: new UniqueEntityID(raw.id),
      value: raw.value,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt === null ? undefined : raw.updatedAt,
      updatedAuthor:
        raw.updatedAuthor?.id === null
          ? undefined
          : Estimator.create(
              {
                contractId: new UniqueEntityID(
                  raw.updatedAuthor?.contractId == null
                    ? undefined
                    : raw.updatedAuthor?.contractId
                ),
                baseId: new UniqueEntityID(
                  raw.updatedAuthor?.baseId == null
                    ? undefined
                    : raw.updatedAuthor?.baseId
                ),
                cpf: raw.updatedAuthor?.cpf ?? "",
                email: raw.updatedAuthor?.email ?? "",
                name: raw.updatedAuthor?.name ?? "",
                password: raw.updatedAuthor?.password ?? "",
                type: updatedAuthorType,
                status: raw.updatedAuthor?.status ?? "",
              },
              new UniqueEntityID(raw.updatedAuthor?.id)
            ),
      material: Material.create(
        {
          code: raw.material?.code ?? 0,
          contractId: new UniqueEntityID(raw.material?.contractId),
          description: raw.material?.description ?? "",
          type: raw.material?.type ?? "",
          unit: raw.material?.unit ?? "",
        },
        new UniqueEntityID(raw.material?.id)
      ),
      estimator: Estimator.create(
        {
          contractId: new UniqueEntityID(
            raw.user?.contractId == null ? undefined : raw.user?.contractId
          ),
          baseId: new UniqueEntityID(
            raw.user?.baseId == null ? undefined : raw.user?.baseId
          ),
          cpf: raw.user?.cpf ?? "",
          email: raw.user?.email ?? "",
          name: raw.user?.name ?? "",
          password: raw.user?.password ?? "",
          type: userType,
          status: raw.user?.status ?? "",
        },
        new UniqueEntityID(raw.user?.id)
      ),
      project: Project.create(
        {
          baseId: new UniqueEntityID(raw.project?.baseId),
          city: raw.project?.city ?? "",
          description: raw.project?.description ?? "",
          project_number: raw.project?.project_number ?? "",
          type: raw.project?.type ?? "",
        },
        new UniqueEntityID(raw.project?.id)
      ),
      contract: Contract.create(
        {
          contractName: raw.contract?.contractName ?? "",
        },
        new UniqueEntityID(raw.contract?.id)
      ),
    });
  }

  private static isUserType(type: string): type is "Orçamentista" {
    return ["Orçamentista"].includes(type as UserType);
  }
}
