import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { BudgetRepository } from "../../repositories/budget-repository";
import { ProjectRepository } from "../../repositories/project-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { Budget } from "src/domain/material-movimentation/enterprise/entities/budget";

interface FetchOnlyProjectsOfBudgetsUseCaseRequest {
  project_numbers: string[];
  contractId: string;
}

interface ProjectAndId {
  id: string;
  project_number: string;
}

type FetchOnlyProjectsOfBudgetsUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    foundProjects: ProjectAndId[];
  }
>;

@Injectable()
export class FetchOnlyProjectsOfBudgetsUseCase {
  constructor(
    private budgetRepository: BudgetRepository,
    private projectRepository: ProjectRepository
  ) {}

  async execute({
    project_numbers,
    contractId,
  }: FetchOnlyProjectsOfBudgetsUseCaseRequest): Promise<FetchOnlyProjectsOfBudgetsUseCaseResponse> {
    const projects =
      await this.projectRepository.findByProjectNumberAndContractIds(
        project_numbers,
        contractId
      );

    if (projects.length === 0)
      return left(
        new ResourceNotFoundError(
          "Nenhum dos projetos informados está cadastrado"
        )
      );

    const projectIds = projects.map((project) => project.id.toString());

    const maxProjectDate = this.maxProjectDate(projects);
    const minProjectDate = this.minProjectDate(projects);

    const budgets = await this.budgetRepository.findByProjectIds(
      projectIds,
      contractId,
      minProjectDate,
      maxProjectDate
    );

    if (!budgets.length)
      return left(new ResourceNotFoundError("Nenhum orçamento não encontrado"));

    const projectIdsOnBudgets = budgets.map((budget) =>
      budget.projectId.toString()
    );

    const foundProjects = this.createProjectAndIdArray(
      projects,
      budgets
    ).filter((foundProject) => projectIdsOnBudgets.includes(foundProject.id));

    return right({ foundProjects });
  }

  private createProjectAndIdArray(
    projects: Project[],
    budgets: Budget[]
  ): ProjectAndId[] {
    const uniqueFoundProjects: Record<string, ProjectAndId> = {};

    budgets.forEach((budget) => {
      const project = projects.find(
        (project) => project.id.toString() === budget.projectId.toString()
      );

      if (project && project.project_number) {
        uniqueFoundProjects[project.project_number] = {
          id: budget.projectId.toString(),
          project_number: project.project_number,
        };
      }
    });

    return Object.values(uniqueFoundProjects);
  }

  private maxProjectDate(projects: Project[]): Date | undefined {
    return projects
      .filter((project) => project.lastBudgetRegister !== undefined)
      .map((project) => project.lastBudgetRegister!)
      .reduce((latest, current) => {
        return !latest || current > latest ? current : latest;
      }, undefined as Date | undefined);
  }

  private minProjectDate(projects: Project[]): Date | undefined {
    return projects
      .filter((project) => project.firstBudgetRegister !== undefined)
      .map((project) => project.firstBudgetRegister!)
      .reduce((earliest, current) => {
        return !earliest || current < earliest ? current : earliest;
      }, undefined as Date | undefined);
  }
}
