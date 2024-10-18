import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { ProjectRepository } from "../../repositories/project-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { Storekeeper } from "src/domain/material-movimentation/enterprise/entities/storekeeper";
import { Material } from "src/domain/material-movimentation/enterprise/entities/material";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { BaseRepository } from "../../repositories/base-repository";
import { Base } from "src/domain/material-movimentation/enterprise/entities/base";
import { Estimator } from "src/domain/material-movimentation/enterprise/entities/estimator";
import { ResourceAlreadyRegisteredError } from "../errors/resource-already-registered-error";

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
    projects: Project[];
  }
>;

@Injectable()
export class RegisterListOfProjectsUseCase {
  constructor(
    private projectRepository: ProjectRepository,
    private baseRepository: BaseRepository
  ) {}

  private project_numbers: string = "";
  private contractId: string = "";

  async execute(
    resquestUseCase: RegisterListOfProjectsUseCaseRequest[]
  ): Promise<RegisterListOfProjectsResponse> {
    this.project_numbers = "";
    this.contractId = "";

    const { containsIdError, message } = await this.verifyResourcesId(
      resquestUseCase
    );

    if (containsIdError) {
      if (!message.includes("Projetos"))
        return left(new ResourceNotFoundError(message));
      else return left(new ResourceAlreadyRegisteredError(message));
    }

    const projects = resquestUseCase.map((project) => {
      return Project.create({
        project_number: project.project_number,
        description: project.description,
        type: project.type,
        baseId: new UniqueEntityID(project.baseId),
        city: project.city,
      });
    });

    await this.projectRepository.create(projects);

    return right({ projects });
  }

  private async verifyResourcesId(
    resquestUseCase: RegisterListOfProjectsUseCaseRequest[]
  ) {
    let containsIdError = false;
    let message;

    if (!(await this.verifyIfIdsExist(resquestUseCase, "baseId"))) {
      containsIdError = true;
      message = "pelo menos um dos baseIds não encontrado";
    }

    if (!(await this.verifyIfIdsExist(resquestUseCase, "project_number"))) {
      containsIdError = true;
      message = `Projetos ${this.project_numbers} já cadastrados`;
    }

    return { containsIdError, message };
  }

  private async verifyIfIdsExist(
    resquestUseCase: RegisterListOfProjectsUseCaseRequest[],
    key: keyof RegisterListOfProjectsUseCaseRequest
  ): Promise<boolean> {
    const uniqueValuesArray = this.uniqueValues(resquestUseCase, key);

    let result:
      | Array<Estimator | Storekeeper>
      | Material[]
      | Project[]
      | Base[] = [];

    switch (key) {
      case "project_number":
        result = await this.projectRepository.findByProjectNumberAndContractIds(
          uniqueValuesArray,
          this.contractId
        );
        result.map((project, index) => {
          this.project_numbers += `${project.project_number}`;
          if (index + 1 !== result.length) this.project_numbers += ", ";
        });
        break;
      case "baseId":
        result = await this.baseRepository.findByIds(uniqueValuesArray);
        this.contractId = result[0].contractId.toString() ?? "";
        break;
      default:
        result = [];
        break;
    }
    if (key === "baseId")
      return uniqueValuesArray.length === result.length ? true : false;
    if (key === "project_number") return result.length === 0 ? true : false;
    else return false;
  }

  private uniqueValues(
    resquestUseCase: RegisterListOfProjectsUseCaseRequest[],
    key: keyof RegisterListOfProjectsUseCaseRequest
  ): string[] {
    return [
      ...new Set(
        resquestUseCase.map((movimentation) => String(movimentation[key]))
      ),
    ];
  }
}
