import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { ProjectRepository } from "../../repositories/project-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { Storekeeper } from "src/domain/material-movimentation/enterprise/entities/storekeeper";
import { Material } from "src/domain/material-movimentation/enterprise/entities/material";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { BaseRepository } from "../../repositories/base-repository";
import { Base } from "src/domain/material-movimentation/enterprise/entities/base";
import { Estimator } from "src/domain/material-movimentation/enterprise/entities/estimator";
import { ResourceAlreadyRegisteredError } from "../errors/resource-already-registered-error";
import { NotValidError } from "../errors/not-valid-error";

interface RegisterListOfProjectsUseCaseRequest {
  project_number: string;
  description: string;
  type: string;
  baseName: string;
  city: string;
}

type RegisterListOfProjectsResponse = Eihter<
  ResourceAlreadyRegisteredError | ResourceNotFoundError | NotValidError,
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
  private bases: Base[] = [];

  async execute(
    requestUseCase: RegisterListOfProjectsUseCaseRequest[]
  ): Promise<RegisterListOfProjectsResponse> {
    this.project_numbers = "";
    this.bases = [];

    const { containsErrorType, message } = await this.verifyResourcesId(
      requestUseCase
    );

    if (containsErrorType) {
      switch (containsErrorType) {
        case "project":
          return left(new ResourceAlreadyRegisteredError(message));
        case "base":
          return left(new ResourceNotFoundError(message));
        case "contract":
          return left(new NotValidError(message));
      }
    }

    const requestWithId = this.replaceBaseNameToBaseId(requestUseCase);

    const projects = requestWithId.map((project) => {
      return Project.create({
        project_number: project.project_number,
        description: project.description,
        type: project.type,
        baseId: project.baseId,
        city: project.city,
      });
    });

    await this.projectRepository.create(projects);

    return right({ projects });
  }

  private async verifyResourcesId(
    requestUseCase: RegisterListOfProjectsUseCaseRequest[]
  ) {
    let containsErrorType: "base" | "contract" | "project" | undefined =
      undefined;
    let message: string = "";

    if (!(await this.verifyIfExist(requestUseCase, "baseName"))) {
      let nomesDasBases: string = ``;
      this.bases.forEach((base, index) => {
        nomesDasBases += base.baseName;
        if (this.bases.length !== index) nomesDasBases += `, `;
      });
      containsErrorType = "base";
      message = `Nome de base não encontrado. Somente as seguintes bases são aceitas: ${nomesDasBases}`;
      return { containsErrorType, message };
    }

    const uniqueBases = this.uniqueValues(requestUseCase, "baseName")
      .map((baseName) => this.bases.find((base) => base.baseName === baseName))
      .filter((base) => base !== undefined);

    if (this.uniqueValues(uniqueBases, "contractId").length > 1) {
      containsErrorType = "contract";
      message = `Não é permitido registrar projetos de bases que não são do mesmo contrato`;
      return { containsErrorType, message };
    }

    if (!(await this.verifyIfExist(requestUseCase, "project_number"))) {
      containsErrorType = "project";
      message = `Projetos ${this.project_numbers} já cadastrados`;
      return { containsErrorType, message };
    }

    return { containsErrorType, message };
  }

  private async verifyIfExist(
    requestUseCase: RegisterListOfProjectsUseCaseRequest[],
    key: keyof RegisterListOfProjectsUseCaseRequest
  ): Promise<boolean> {
    const uniqueValuesArray = this.uniqueValues(requestUseCase, key);

    let result:
      | Array<Estimator | Storekeeper>
      | Material[]
      | Project[]
      | Base[] = [];

    switch (key) {
      case "project_number":
        const contractId = this.getContractId(this.bases, requestUseCase);
        result = await this.projectRepository.findByProjectNumberAndContractIds(
          uniqueValuesArray,
          contractId
        );
        result.map((project, index) => {
          this.project_numbers += `${project.project_number}`;
          if (index + 1 !== result.length) this.project_numbers += ", ";
        });
        break;
      case "baseName":
        result = await this.baseRepository.findMany({ page: 1 });
        this.bases = result;
        break;
      default:
        result = [];
        break;
    }

    if (key === "baseName") {
      if (requestUseCase.length === 0) return true;
      const allBaseNamesRegistered = new Set(
        this.bases.map((base) => base.baseName)
      );
      return requestUseCase.every((request) =>
        allBaseNamesRegistered.has(request.baseName)
      );
    }
    if (key === "project_number") return result.length === 0 ? true : false;
    else return false;
  }

  private uniqueValues<T>(requestUseCase: T[], key: keyof T): string[] {
    return [...new Set(requestUseCase.map((item) => String(item[key])))];
  }

  private replaceBaseNameToBaseId(
    request: RegisterListOfProjectsUseCaseRequest[]
  ) {
    return request.map((req) => {
      return {
        project_number: req.project_number,
        description: req.description,
        type: req.type,
        baseId: this.bases.find((base) => base.baseName === req.baseName)!.id,
        city: req.city,
      };
    });
  }

  private getContractId(
    bases: Base[],
    request: RegisterListOfProjectsUseCaseRequest[]
  ) {
    return bases
      .find((base) => request[0].baseName === base.baseName)!
      .contractId.toString();
  }
}
