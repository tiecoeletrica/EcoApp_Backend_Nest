import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { Budget } from "../../../enterprise/entities/budget";
import { BudgetRepository } from "../../repositories/budget-repository";
import { UserRepository } from "../../repositories/user-repository";
import { MaterialRepository } from "../../repositories/material-repository";
import { ProjectRepository } from "../../repositories/project-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { Material } from "src/domain/material-movimentation/enterprise/entities/material";

interface UpdatedBudget {
  budgetId: string;
  value: number;
}

interface NewBudget {
  materialId: string;
  value: number;
}

interface EditBudgetUseCaseRequest {
  estimatorId: string;
  projectId: string;
  updatedBudgets: UpdatedBudget[];
  newBudgets: NewBudget[];
}

type EditBudgetResponse = Eihter<
  ResourceNotFoundError,
  {
    newBudgets: Budget[];
    updatedBudgets: Budget[];
  }
>;

@Injectable()
export class EditBudgetUseCase {
  constructor(
    private budgetRepository: BudgetRepository,
    private userRepository: UserRepository,
    private materialRepository: MaterialRepository,
    private projectRepository: ProjectRepository
  ) {}

  private toUpdateBudgets: Budget[] = [];

  async execute(
    editBudgetUseCaseRequest: EditBudgetUseCaseRequest
  ): Promise<EditBudgetResponse> {
    this.toUpdateBudgets = [];

    const { containsIdError, message, estimator } =
      await this.verifyResourcesId(editBudgetUseCaseRequest);

    if (containsIdError) return left(new ResourceNotFoundError(message));

    const newBudgets = editBudgetUseCaseRequest.newBudgets.map((budget) => {
      return Budget.create({
        projectId: new UniqueEntityID(editBudgetUseCaseRequest.projectId),
        materialId: new UniqueEntityID(budget.materialId),
        estimatorId: new UniqueEntityID(editBudgetUseCaseRequest.estimatorId),
        contractId: estimator.contractId,
        value: budget.value,
      });
    });

    const updatedBudgets = this.toUpdateBudgets.map((budget) => {
      budget.value = editBudgetUseCaseRequest.updatedBudgets.find(
        (budgetRequest) => budgetRequest.budgetId === budget.id.toString()
      )!.value;
      budget.updatedAuthorId = new UniqueEntityID(
        editBudgetUseCaseRequest.estimatorId
      );

      return budget;
    });

    if (editBudgetUseCaseRequest.newBudgets.length !== 0)
      await this.budgetRepository.create(newBudgets);

    for (let index = 0; index < updatedBudgets.length; index++) {
      await this.budgetRepository.save(updatedBudgets[index]);
    }

    return right({ newBudgets, updatedBudgets });
  }

  private async verifyResourcesId(
    editBudgetUseCaseRequest: EditBudgetUseCaseRequest
  ) {
    let containsIdError = false;
    let message;

    const [estimator] = await this.userRepository.findByIds([
      editBudgetUseCaseRequest.estimatorId,
    ]);
    if (!estimator) {
      containsIdError = true;
      message = "Orçamentista não encontrado";
    }

    const [project] = await this.projectRepository.findByIds([
      editBudgetUseCaseRequest.projectId,
    ]);
    if (!project) {
      containsIdError = true;
      message = "Projeto não encontrado";
    }

    if (
      editBudgetUseCaseRequest.newBudgets.length !== 0 &&
      !(await this.verifyIfIdsExist(
        editBudgetUseCaseRequest.newBudgets,
        "materialId"
      ))
    ) {
      containsIdError = true;
      message = "pelo menos um dos materialIds não encontrado";
    }

    if (
      !(await this.verifyIfIdsExist(
        editBudgetUseCaseRequest.updatedBudgets,
        "budgetId"
      ))
    ) {
      containsIdError = true;
      message = "pelo menos um dos budgetIds não encontrado";
    }

    return { containsIdError, message, estimator };
  }

  private async verifyIfIdsExist(
    editBudgetData: UpdatedBudget[] | NewBudget[],
    key: keyof (UpdatedBudget & NewBudget)
  ): Promise<boolean> {
    const uniqueValuesArray = this.uniqueValues(editBudgetData, key);
    let result: Material[] | Budget[];

    switch (key) {
      case "budgetId":
        result = await this.budgetRepository.findByIds(uniqueValuesArray);
        this.toUpdateBudgets = result;
        break;
      case "materialId":
        result = await this.materialRepository.findByIds(uniqueValuesArray);
        break;
      default:
        result = [];
        break;
    }
    return uniqueValuesArray.length === result.length ? true : false;
  }

  private uniqueValues(
    editBudgetData: UpdatedBudget[] | NewBudget[],
    key: keyof (UpdatedBudget & NewBudget)
  ): string[] {
    return [...new Set(editBudgetData.map((budget) => String(budget[key])))];
  }
}
