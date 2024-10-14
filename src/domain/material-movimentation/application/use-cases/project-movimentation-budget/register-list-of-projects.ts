import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { Project } from "../../../enterprise/entities/project";
import { ProjectRepository } from "../../repositories/project-repository";
import { ResourceAlreadyRegisteredError } from "../errors/resource-already-registered-error";
import { BaseRepository } from "../../repositories/base-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

interface RegisterListOfProjectsUseCaseRequest {
  project_number: string;
  description: string;
  type: string;
  baseId: string;
  city: string;
}

type RegisterListOfProjectsResponse = Eihter<
  ResourceAlreadyRegisteredError | ResourceNotFoundError,
  {
    project: Project[];
  }
>;

@Injectable()
export class RegisterListOfProjectsUseCase {
  constructor(
    private projectRepository: ProjectRepository,
    private baseRepository: BaseRepository
  ) {}

  async execute(request: RegisterListOfProjectsUseCaseRequest[]): Promise<RegisterListOfProjectsResponse> {
    

    const base = await this.baseRepository.findById(baseId);
    if (!base) return left(new ResourceNotFoundError("baseId não encontrado"));

    const projectSearch = await this.projectRepository.findByProjectNumber(
      project_number,
      baseId
    );

    if (projectSearch) return left(new ResourceAlreadyRegisteredError("Projeto já registrado"));

    const project = Project.create({
      project_number,
      description,
      type,
      baseId: new UniqueEntityID(baseId),
      city,
    });

    await this.projectRepository.create(project);

    return right({ project });
  }
}
