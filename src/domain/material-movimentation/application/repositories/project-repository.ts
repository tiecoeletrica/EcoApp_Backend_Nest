import { Project } from "../../enterprise/entities/project";

export abstract class ProjectRepository {
  abstract findByProjectNumber(
    project_number: string,
    baseId: string
  ): Promise<Project | null>;
  abstract findByProjectNumberAndContractId(
    project_number: string,
    contractId: string
  ): Promise<Project | null>;
  abstract findByProjectNumberAndContractIds(
    project_numbers: string[],
    contractId: string
  ): Promise<Project[]>;
  abstract findByProjectNumberWithoutBase(
    project_number: string
  ): Promise<Project | null>;
  abstract findByID(id: string): Promise<Project | null>;
  abstract findByIds(ids: string[]): Promise<Project[]>;
  abstract create(project: Project): Promise<void>;
}
