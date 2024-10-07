import { Injectable } from "@nestjs/common";
import { ProjectRepository } from "src/domain/material-movimentation/application/repositories/project-repository";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { BigQueryService } from "../bigquery.service";
import { BqProjectMapper } from "../mappers/bq-project-mapper";

@Injectable()
export class BqProjectRepository implements ProjectRepository {
  constructor(private bigquery: BigQueryService) {}

  async findByProjectNumber(
    project_number: string,
    baseId: string
  ): Promise<Project | null> {
    const [project] = await this.bigquery.project.select({
      like: { project_number },
      where: { baseId },
    });

    if (!project) return null;

    return BqProjectMapper.toDomain(project);
  }

  async findByProjectNumberAndContractId(
    project_number: string,
    contractId: string
  ): Promise<Project | null> {
    const bases = await this.bigquery.base.select({
      where: { contractId },
    });

    const [project] = await this.bigquery.project.select({
      where: { project_number },
      whereIn: { baseId: bases.map((base) => base.id) },
    });

    if (!project) return null;

    return BqProjectMapper.toDomain(project);
  }

  async findByProjectNumberAndContractIds(
    project_numbers: string[],
    contractId: string
  ): Promise<Project[]> {
    const bases = await this.bigquery.base.select({
      where: { contractId },
    });

    const projects = await this.bigquery.project.select({
      whereIn: {
        baseId: bases.map((base) => base.id),
        project_number: project_numbers,
      },
    });

    return projects.map(BqProjectMapper.toDomain);
  }

  async findByProjectNumberWithoutBase(
    project_number: string
  ): Promise<Project | null> {
    const [project] = await this.bigquery.project.select({
      like: { project_number },
    });

    if (!project) return null;

    return BqProjectMapper.toDomain(project);
  }

  async findByID(id: string): Promise<Project | null> {
    const [project] = await this.bigquery.project.select({
      where: { id },
    });

    if (!project) return null;

    return BqProjectMapper.toDomain(project);
  }

  async findByIds(ids: string[]): Promise<Project[]> {
    const projects = await this.bigquery.project.select({
      whereIn: { id: ids },
    });

    return projects.map(BqProjectMapper.toDomain);
  }

  async create(project: Project): Promise<void> {
    const data = BqProjectMapper.toBigquery(project);

    await this.bigquery.project.create([data]);
  }
}
