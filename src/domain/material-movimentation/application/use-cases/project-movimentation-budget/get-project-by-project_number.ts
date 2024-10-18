import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { ProjectRepository } from "../../repositories/project-repository";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";

interface GetProjectByProjectNumberUseCaseRequest {
  project_number: string;
  contractId: string;
}

type GetProjectByProjectNumberUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    project: Project;
  }
>;

@Injectable()
export class GetProjectByProjectNumberUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute({
    project_number,
    contractId,
  }: GetProjectByProjectNumberUseCaseRequest): Promise<GetProjectByProjectNumberUseCaseResponse> {
    const project =
      await this.projectRepository.findByProjectNumberAndContractId(
        project_number,
        contractId
      );

    if (!project)
      return left(new ResourceNotFoundError(`Projeto ${project_number} não cadastrado`));

    return right({ project });
  }
}
