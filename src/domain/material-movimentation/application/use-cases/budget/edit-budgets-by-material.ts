import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { Budget } from "../../../enterprise/entities/budget";
import { BudgetRepository } from "../../repositories/budget-repository";
import { UserRepository } from "../../repositories/user-repository";
import { MaterialRepository } from "../../repositories/material-repository";
import { ProjectRepository } from "../../repositories/project-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { Material } from "src/domain/material-movimentation/enterprise/entities/material";
import { UserEntities } from "src/core/types/user-type";

interface EditBudgetsByMaterialUseCaseRequest {
  contractId: string;
  estimatorId: string;
  project_numbers: string[];
  codeFrom: number;
  codeTo: number;
  multiplier: number;
}

type EditBudgetsByMaterialResponse = Eihter<
  ResourceNotFoundError,
  {
    budgets: Budget[];
    projects: Project[];
  }
>;

@Injectable()
export class EditBudgetsByMaterialUseCase {
  constructor(
    private budgetRepository: BudgetRepository,
    private userRepository: UserRepository,
    private materialRepository: MaterialRepository,
    private projectRepository: ProjectRepository
  ) {}

  private projects: Project[] = [];

  async execute(
    request: EditBudgetsByMaterialUseCaseRequest
  ): Promise<EditBudgetsByMaterialResponse> {
    this.projects = [];

    const { multiplier, contractId, codeFrom } = request;

    const {
      containsIdError,
      message,
      estimator,
      projects,
      materialFrom,
      materialTo,
    } = await this.verifyResourcesId(request);

    if (containsIdError) return left(new ResourceNotFoundError(message));

    const budgetsToModify = await this.getBudgetsToModify(
      projects,
      contractId,
      materialFrom
    );

    if (budgetsToModify.length === 0)
      return left(
        new ResourceNotFoundError(
          `Não foram encontrados orçamentos do material ${codeFrom} nos projetos informados.`
        )
      );

    const budgets = await this.modifyMaterialsOnBudgets(
      budgetsToModify,
      materialTo,
      multiplier,
      estimator,
      contractId
    );

    await this.registerDateOnProject(budgets);
    
    return right({ budgets, projects });
  }

  private async verifyResourcesId(
    request: EditBudgetsByMaterialUseCaseRequest
  ) {
    let containsIdError = false;
    let message;

    const [estimator] = await this.userRepository.findByIds([
      request.estimatorId,
    ]);
    if (!estimator) {
      containsIdError = true;
      message = "Orçamentista não encontrado";
    }

    const projects =
      await this.projectRepository.findByProjectNumberAndContractIds(
        request.project_numbers,
        request.contractId
      );
    if (projects.length === 0) {
      containsIdError = true;
      message = "Nenhum dos projetos foi encontrado";
    }
    this.projects = projects;

    const materials = await this.materialRepository.findByCodes([
      {
        code: request.codeFrom,
        contractId: request.contractId,
      },
      {
        code: request.codeTo,
        contractId: request.contractId,
      },
    ]);

    const materialFrom = materials.find(
      (material) => material.code === request.codeFrom
    );
    if (!materialFrom) {
      containsIdError = true;
      message = `O material ${request.codeFrom} não está cadastrado`;
    }

    const materialTo = materials.find(
      (material) => material.code === request.codeTo
    );
    if (!materialTo) {
      containsIdError = true;
      message = `O material ${request.codeTo} não está cadastrado`;
    }

    if (estimator.contractId.toString() !== request.contractId) {
      containsIdError = true;
      message = `Contrato inválido`;
    }

    return {
      containsIdError,
      message,
      estimator,
      projects,
      materialFrom: materialFrom as Material,
      materialTo: materialTo as Material,
    };
  }

  private async getBudgetsToModify(
    projects: Project[],
    contractId: string,
    materialFrom: Material
  ): Promise<Budget[]> {
    const projectIds = projects.map((project) => project.id.toString());

    const materialId = materialFrom.id.toString();

    const budgetsToModify =
      await this.budgetRepository.findManyByProjectMaterial(
        projectIds,
        contractId,
        materialId
      );

    return budgetsToModify;
  }

  private async modifyMaterialsOnBudgets(
    budgetsToModify: Budget[],
    materialTo: Material,
    multiplier: number,
    estimator: UserEntities,
    contractId: string
  ): Promise<Budget[]> {
    let newBudgets: Budget[] = [];
    let editedBudgets: Budget[] = [];

    budgetsToModify.forEach((budget) => {
      newBudgets.push(
        Budget.create({
          contractId: new UniqueEntityID(contractId),
          estimatorId: estimator.id,
          materialId: materialTo.id,
          projectId: budget.projectId,
          value: budget.value * multiplier,
        })
      );

      budget.value = 0;
      budget.updatedAuthorId = estimator.id;
      editedBudgets.push(budget);
    });

    await this.budgetRepository.create(newBudgets);
    await this.budgetRepository.saveBulk(editedBudgets);

    const budgets = newBudgets.concat(editedBudgets);

    return budgets;
  }

  private async registerDateOnProject(budgets: Budget[]): Promise<void> {
    const updatedProjects = this.projects.map((project) => {
      const budgetMaxDate = new Date(
        new Date(
          Math.max(
            ...budgets
              .filter(
                (budget) =>
                  budget.projectId.toString() === project.id.toString()
              )
              .map((budget) => budget.createdAt.getTime())
          )
        ).setMilliseconds(999)
      );

      const budgetMinDate = new Date(
        new Date(
          Math.min(
            ...budgets
              .filter(
                (budget) =>
                  budget.projectId.toString() === project.id.toString()
              )
              .map((budget) => budget.createdAt.getTime())
          )
        ).setMilliseconds(0)
      );

      if (project.firstBudgetRegister) {
        project.lastBudgetRegister = budgetMaxDate;
      } else {
        project.firstBudgetRegister = budgetMinDate;
        project.lastBudgetRegister = budgetMaxDate;
      }
      return project;
    });
    await this.projectRepository.saveBulk(updatedProjects);
  }
}
