import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { BudgetRepository } from "../../repositories/budget-repository";
import { ProjectRepository } from "../../repositories/project-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { BudgetWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/budget-with-details";

interface FetchBudgetByProjectNameUseCaseRequest {
  project_number: string;
  contractId: string;
}

type FetchBudgetByProjectNameUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    budgets: BudgetWithDetails[];
  }
>;

@Injectable()
export class FetchBudgetByProjectNameUseCase {
  constructor(
    private budgetRepository: BudgetRepository,
    private projectRepository: ProjectRepository
  ) {}

  async execute({
    project_number,
    contractId,
  }: FetchBudgetByProjectNameUseCaseRequest): Promise<FetchBudgetByProjectNameUseCaseResponse> {
    const project =
      await this.projectRepository.findByProjectNumberAndContractId(
        project_number,
        contractId
      );

    if (!project)
      return left(new ResourceNotFoundError("Projeto não encontrado"));

    const budgets = await this.budgetRepository.findByProjectWithDetails(
      project.id.toString(),
      contractId
    );

    if (!budgets.length)
      return left(new ResourceNotFoundError("Orçamento não encontrado"));

    return right({ budgets });
  }
}
