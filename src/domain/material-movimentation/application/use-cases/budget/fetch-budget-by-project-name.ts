import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { BudgetRepository } from "../../repositories/budget-repository";
import { ProjectRepository } from "../../repositories/project-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { BudgetWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/budget-with-details";

interface FetchBudgetByProjectNameUseCaseRequest {
  project_number: string;
  contractId: string;
  sendProjectId?: boolean;
}

type FetchBudgetByProjectNameUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    budgets: BudgetWithDetails[];
    projectId?: string;
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
    sendProjectId,
  }: FetchBudgetByProjectNameUseCaseRequest): Promise<FetchBudgetByProjectNameUseCaseResponse> {
    const project =
      await this.projectRepository.findByProjectNumberAndContractId(
        project_number,
        contractId
      );

    if (!project)
      return left(
        new ResourceNotFoundError(`Projeto ${project_number} não cadastrado`)
      );

    const budgets = await this.budgetRepository.findByProjectWithDetails(
      project.id.toString(),
      contractId
    );

    if (!budgets.length && !sendProjectId)
      return left(new ResourceNotFoundError("Orçamento não encontrado"));
    else if (sendProjectId)
      return right({ budgets, projectId: project.id.toString() });
    else return right({ budgets });
  }
}
