import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { BudgetRepository } from "../../repositories/budget-repository";
import { ProjectRepository } from "../../repositories/project-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { Budget } from "src/domain/material-movimentation/enterprise/entities/budget";
import { MaterialRepository } from "../../repositories/material-repository";

interface FetchProjectsBudgetsByMaterialsUseCaseRequest {
  material_codes: number[];
  contractId: string;
}

interface ProjectAndId {
  id: string;
  project_number: string;
}

type FetchProjectsBudgetsByMaterialsUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    foundProjects: ProjectAndId[];
  }
>;

@Injectable()
export class FetchProjectsBudgetsByMaterialsUseCase {
  constructor(
    private budgetRepository: BudgetRepository,
    private projectRepository: ProjectRepository,
    private materialRepository: MaterialRepository
  ) {}

  async execute({
    material_codes,
    contractId,
  }: FetchProjectsBudgetsByMaterialsUseCaseRequest): Promise<FetchProjectsBudgetsByMaterialsUseCaseResponse> {
    const materialSearchObject = material_codes.map((material_code) => {
      return {
        code: material_code,
        contractId,
      };
    });

    const materials = await this.materialRepository.findByCodes(
      materialSearchObject
    );

    if (materials.length === 0)
      return left(
        new ResourceNotFoundError(
          "Nenhum dos códigos informados está cadastrado"
        )
      );

    const materialIds = materials.map((material) => material.id.toString());

    const budgets = await this.budgetRepository.findByMaterialIds(
      materialIds,
      contractId
    );

    if (!budgets.length)
      return left(new ResourceNotFoundError("Nenhum orçamento não encontrado"));

    const uniqueProjectIds = this.uniqueValues(budgets, "projectId");

    const projectIdsWithAllMaterials = this.filterProjectsWithAllMaterials(
      uniqueProjectIds,
      budgets,
      materialIds
    );

    if (!projectIdsWithAllMaterials.length)
      return left(
        new ResourceNotFoundError(
          "Nenhum orçamento encontrado com todos os materiais informados"
        )
      );

    const projects = await this.projectRepository.findByIds(
      projectIdsWithAllMaterials
    );

    const foundProjects = this.createProjectAndIdArray(projects);

    return right({ foundProjects });
  }

  private createProjectAndIdArray(projects: Project[]): ProjectAndId[] {
    const uniqueFoundProjects: Record<string, ProjectAndId> = {};

    projects.forEach((project) => {
      uniqueFoundProjects[project.project_number] = {
        id: project.id.toString(),
        project_number: project.project_number,
      };
    });

    return Object.values(uniqueFoundProjects);
  }

  private filterProjectsWithAllMaterials(
    uniqueProjectIds: string[],
    budgets: Budget[],
    materialIds: string[]
  ): string[] {
    return uniqueProjectIds.filter((projectId) => {
      const projectIdbudgets = budgets.filter(
        (budget) =>
          budget.projectId.toString() === projectId &&
          materialIds.includes(budget.materialId.toString())
      );

      return materialIds.every((materialId) =>
        projectIdbudgets.find(
          (budget) => budget.materialId.toString() === materialId
        )
      );
    });
  }

  private uniqueValues(budgets: Budget[], key: keyof Budget): string[] {
    return [...new Set(budgets.map((budget) => String(budget[key])))];
  }
}
