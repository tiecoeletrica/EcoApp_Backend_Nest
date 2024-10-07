import { ProjectRepository } from "../../src/domain/material-movimentation/application/repositories/project-repository";
import { Project } from "../../src/domain/material-movimentation/enterprise/entities/project";
import { InMemoryBaseRepository } from "./in-memory-base-repository";

export class InMemoryProjectRepository implements ProjectRepository {
  public items: Project[] = [];

  constructor(private baseRepository: InMemoryBaseRepository) {}

  async findByProjectNumber(
    project_number: string,
    baseId: string
  ): Promise<Project | null> {
    const project = this.items.find(
      (item) =>
        item.project_number === project_number &&
        item.baseId.toString() === baseId
    );

    if (!project) return null;

    return project;
  }

  async findByProjectNumberAndContractId(
    project_number: string,
    contractId: string
  ): Promise<Project | null> {
    const basesIds = this.baseRepository.items
      .filter((base) => base.contractId.toString() === contractId)
      .map((base) => base.id.toString());

    const project = this.items.find(
      (item) =>
        item.project_number === project_number &&
        basesIds.includes(item.baseId.toString())
    );

    if (!project) return null;

    return project;
  }

  async findByProjectNumberAndContractIds(
    project_numbers: string[],
    contractId: string
  ): Promise<Project[]> {
    const basesIds = this.baseRepository.items
      .filter((base) => base.contractId.toString() === contractId)
      .map((base) => base.id.toString());

    const projects = this.items.filter(
      (item) =>
        project_numbers.includes(item.project_number) &&
        basesIds.includes(item.baseId.toString())
    );

    return projects;
  }

  async findByProjectNumberWithoutBase(
    project_number: string
  ): Promise<Project | null> {
    const project = this.items.find((item) =>
      item.project_number.includes(project_number)
    );

    if (!project) return null;

    return project;
  }

  async findByID(id: string): Promise<Project | null> {
    const project = this.items.find((item) => item.id.toString() === id);

    if (!project) return null;

    return project;
  }

  async findByIds(ids: string[]): Promise<Project[]> {
    const project = this.items.filter((item) =>
      ids.includes(item.id.toString())
    );

    return project;
  }

  async create(project: Project) {
    this.items.push(project);
  }
}
