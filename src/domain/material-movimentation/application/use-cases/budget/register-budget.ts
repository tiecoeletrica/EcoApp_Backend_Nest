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
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { ContractRepository } from "../../repositories/contract-repository";
import { Contract } from "src/domain/material-movimentation/enterprise/entities/contract";
import { Estimator } from "src/domain/material-movimentation/enterprise/entities/estimator";
import { Storekeeper } from "src/domain/material-movimentation/enterprise/entities/storekeeper";

interface RegisterBudgetUseCaseRequest {
  estimatorId: string;
  materialId: string;
  projectId: string;
  contractId: string;
  value: number;
  createdAt?: Date;
}

type RegisterBudgetResponse = Eihter<
  ResourceNotFoundError,
  {
    budgets: Budget[];
  }
>;

@Injectable()
export class RegisterBudgetUseCase {
  constructor(
    private budgetRepository: BudgetRepository,
    private userRepository: UserRepository,
    private materialRepository: MaterialRepository,
    private projectRepository: ProjectRepository,
    private contractRepository: ContractRepository
  ) {}

  async execute(
    registerBudgetUseCaseRequest: RegisterBudgetUseCaseRequest[]
  ): Promise<RegisterBudgetResponse> {
    const { containsIdError, message } = await this.verifyResourcesId(
      registerBudgetUseCaseRequest
    );

    if (containsIdError) return left(new ResourceNotFoundError(message));

    const budgets = registerBudgetUseCaseRequest.map((budget) => {
      return Budget.create({
        projectId: new UniqueEntityID(budget.projectId),
        materialId: new UniqueEntityID(budget.materialId),
        estimatorId: new UniqueEntityID(budget.estimatorId),
        contractId: new UniqueEntityID(budget.contractId),
        value: budget.value,
        createdAt: budget.createdAt,
      });
    });

    await this.budgetRepository.create(budgets);

    return right({ budgets });
  }

  private async verifyResourcesId(
    registerBudgetUseCaseRequest: RegisterBudgetUseCaseRequest[]
  ) {
    let containsIdError = false;
    let message;

    if (
      !(await this.verifyIfIdsExist(
        registerBudgetUseCaseRequest,
        "estimatorId"
      ))
    ) {
      containsIdError = true;
      message = "pelo menos um dos userIds não encontrado";
    }

    if (
      !(await this.verifyIfIdsExist(registerBudgetUseCaseRequest, "materialId"))
    ) {
      containsIdError = true;
      message = "pelo menos um dos materialIds não encontrado";
    }

    if (
      !(await this.verifyIfIdsExist(registerBudgetUseCaseRequest, "projectId"))
    ) {
      containsIdError = true;
      message = "pelo menos um dos projectIds não encontrado";
    }

    if (
      !(await this.verifyIfIdsExist(registerBudgetUseCaseRequest, "contractId"))
    ) {
      containsIdError = true;
      message = "pelo menos um dos contractIds não encontrado";
    }

    return { containsIdError, message };
  }

  private async verifyIfIdsExist(
    registerBudgetUseCaseRequest: RegisterBudgetUseCaseRequest[],
    key: keyof RegisterBudgetUseCaseRequest
  ): Promise<boolean> {
    const uniqueValuesArray = this.uniqueValues(
      registerBudgetUseCaseRequest,
      key
    );

    let result:
      | Array<Estimator | Storekeeper>
      | Material[]
      | Project[]
      | Contract[] = [];

    switch (key) {
      case "estimatorId":
        result = await this.userRepository.findByIds(uniqueValuesArray);
        break;
      case "materialId":
        result = await this.materialRepository.findByIds(uniqueValuesArray);
        break;
      case "projectId":
        result = await this.projectRepository.findByIds(uniqueValuesArray);
        break;
      case "contractId":
        result = await this.contractRepository.findByIds(uniqueValuesArray);
        break;
      default:
        result = [];
        break;
    }

    return uniqueValuesArray.length === result.length ? true : false;
  }

  private uniqueValues(
    registerBudgetUseCaseRequest: RegisterBudgetUseCaseRequest[],
    key: keyof RegisterBudgetUseCaseRequest
  ): string[] {
    return [
      ...new Set(
        registerBudgetUseCaseRequest.map((budget) => String(budget[key]))
      ),
    ];
  }
}
