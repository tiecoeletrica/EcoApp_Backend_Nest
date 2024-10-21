import { BudgetWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/budget-with-details";
import { BudgetRepository } from "../../src/domain/material-movimentation/application/repositories/budget-repository";
import { Budget } from "../../src/domain/material-movimentation/enterprise/entities/budget";
import { InMemoryContractRepository } from "./in-memory-contract-repository";
import { InMemoryMaterialRepository } from "./in-memory-material-repository";
import { InMemoryProjectRepository } from "./in-memory-project-repository";
import { InMemoryUserRepository } from "./in-memory-user-repository";

export class InMemoryBudgetRepository implements BudgetRepository {
  public items: Budget[] = [];

  constructor(
    private userRepository: InMemoryUserRepository,
    private materialRepository: InMemoryMaterialRepository,
    private projectRepository: InMemoryProjectRepository,
    private contractRepository: InMemoryContractRepository
  ) {}

  async findByProject(projectid: string): Promise<Budget[]> {
    const budgets = this.items.filter(
      (budget) => budget.projectId.toString() === projectid
    );

    return budgets;
  }

  async findByIds(budgetIds: string[]): Promise<Budget[]> {
    const budgets = this.items.filter((budget) =>
      budgetIds.includes(budget.id.toString())
    );

    return budgets;
  }

  async findByProjectWithDetails(
    projectid: string,
    contractId: string
  ): Promise<BudgetWithDetails[]> {
    const budgets = this.items
      .filter(
        (budget) =>
          budget.projectId.toString() === projectid &&
          budget.contractId.toString() === contractId
      )
      .map((budget) => {
        const estimator = this.userRepository.items.find(
          (estimator) => estimator.id === budget.estimatorId
        );
        if (!estimator) {
          throw new Error(`estimator ${budget.estimatorId} does not exist.`);
        }
        const author = this.userRepository.items.find(
          (estimator) => estimator.id === budget.updatedAuthorId
        );
        if (!author && budget.updatedAuthorId) {
          throw new Error(`author ${budget.updatedAuthorId} does not exist.`);
        }
        const project = this.projectRepository.items.find(
          (project) => project.id === budget.projectId
        );
        if (!project) {
          throw new Error(`project ${budget.projectId} does not exist.`);
        }
        const contract = this.contractRepository.items.find(
          (contract) => contract.id === budget.contractId
        );
        if (!contract) {
          throw new Error(`contract ${budget.contractId} does not exist.`);
        }
        const material = this.materialRepository.items.find(
          (material) => material.id === budget.materialId
        );
        if (!material) {
          throw new Error(`material ${budget.materialId} does not exist.`);
        }

        return BudgetWithDetails.create({
          budgetId: budget.id,
          value: budget.value,
          createdAt: budget.createdAt,
          estimator,
          material,
          project,
          contract,
          updatedAuthor: author,
          updatedAt: budget.updatedAt,
        });
      });

    return budgets;
  }

  async findByProjectIds(
    projectids: string[],
    contractId: string
  ): Promise<Budget[]> {
    const budgets = this.items.filter(
      (budget) =>
        projectids.includes(budget.projectId.toString()) &&
        budget.contractId.toString() === contractId
    );

    return budgets;
  }

  async findByMaterialIds(
    materialids: string[],
    contractId: string
  ): Promise<Budget[]> {
    const budgets = this.items.filter(
      (budget) =>
        materialids.includes(budget.materialId.toString()) &&
        budget.contractId.toString() === contractId
    );

    return budgets;
  }

  async findByProjectIdsWithDetails(
    projectids: string[],
    contractId: string
  ): Promise<BudgetWithDetails[]> {
    const budgets = this.items
      .filter(
        (budget) =>
          projectids.includes(budget.projectId.toString()) &&
          budget.contractId.toString() === contractId
      )
      .map((budget) => {
        const estimator = this.userRepository.items.find(
          (estimator) => estimator.id === budget.estimatorId
        );
        if (!estimator) {
          throw new Error(`estimator ${budget.estimatorId} does not exist.`);
        }
        const author = this.userRepository.items.find(
          (estimator) => estimator.id === budget.updatedAuthorId
        );
        if (!author && budget.updatedAuthorId) {
          throw new Error(`author ${budget.updatedAuthorId} does not exist.`);
        }
        const project = this.projectRepository.items.find(
          (project) => project.id === budget.projectId
        );
        if (!project) {
          throw new Error(`project ${budget.projectId} does not exist.`);
        }
        const contract = this.contractRepository.items.find(
          (contract) => contract.id === budget.contractId
        );
        if (!contract) {
          throw new Error(`contract ${budget.contractId} does not exist.`);
        }
        const material = this.materialRepository.items.find(
          (material) => material.id === budget.materialId
        );
        if (!material) {
          throw new Error(`material ${budget.materialId} does not exist.`);
        }

        return BudgetWithDetails.create({
          budgetId: budget.id,
          value: budget.value,
          createdAt: budget.createdAt,
          estimator,
          material,
          project,
          contract,
          updatedAuthor: author,
          updatedAt: budget.updatedAt,
        });
      });

    return budgets;
  }

  async findManyByProjectMaterial(
    projectids: string[],
    contractId: string,
    materialId: string
  ): Promise<Budget[]> {
    const budgets = this.items.filter(
      (budget) =>
        projectids.includes(budget.projectId.toString()) &&
        budget.contractId.toString() === contractId &&
        budget.materialId.toString() === materialId
    );

    return budgets;
  }

  async create(budgets: Budget[]) {
    budgets.map((budget) => this.items.push(budget));
  }

  async save(budget: Budget) {
    const itemIndex = this.items.findIndex(
      (item) => item.id.toString() === budget.id.toString()
    );

    this.items[itemIndex] = budget;
  }
}
