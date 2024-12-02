import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { Movimentation } from "../../../enterprise/entities/movimentation";
import { MovimentationRepository } from "../../repositories/movimentation-repository";
import { UserRepository } from "../../repositories/user-repository";
import { MaterialRepository } from "../../repositories/material-repository";
import { ProjectRepository } from "../../repositories/project-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { Material } from "src/domain/material-movimentation/enterprise/entities/material";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { BaseRepository } from "../../repositories/base-repository";
import { Base } from "src/domain/material-movimentation/enterprise/entities/base";
import { NotValidError } from "../../../../../core/errors/errors/not-valid-error";
import { UserEntities } from "src/core/types/user-type";

interface TransferMaterialUseCaseRequest {
  storekeeperId: string;
  materialId: string;
  projectId: string;
  observation: string;
  baseId: string;
  value: number;
  createdAt?: Date;
  ignoreValidations?: boolean;
}

type TransferMaterialResponse = Eihter<
  ResourceNotFoundError | NotValidError,
  {
    movimentations: Movimentation[];
  }
>;

@Injectable()
export class TransferMaterialUseCase {
  constructor(
    private movimentationRepository: MovimentationRepository,
    private userRepository: UserRepository,
    private materialRepository: MaterialRepository,
    private projectRepository: ProjectRepository,
    private baseRepository: BaseRepository
  ) {}

  private materials: Material[] = [];
  private projects: Project[] = [];

  async execute(
    transferMaterialUseCaseRequest: TransferMaterialUseCaseRequest[]
  ): Promise<TransferMaterialResponse> {
    this.materials = [];
    this.projects = [];

    const { containsIdError, message } = await this.verifyResourcesId(
      transferMaterialUseCaseRequest
    );

    if (containsIdError) return left(new ResourceNotFoundError(message));

    const { containsEquipmentWithoutDetails, messageEquipment } =
      this.verifyEquipmentDetails(transferMaterialUseCaseRequest);

    if (containsEquipmentWithoutDetails)
      return left(new NotValidError(messageEquipment));

    const movimentations = transferMaterialUseCaseRequest.map(
      (movimentation) => {
        return Movimentation.create({
          projectId: new UniqueEntityID(movimentation.projectId),
          materialId: new UniqueEntityID(movimentation.materialId),
          storekeeperId: new UniqueEntityID(movimentation.storekeeperId),
          observation: movimentation.observation,
          baseId: new UniqueEntityID(movimentation.baseId),
          value: movimentation.value,
          createdAt: movimentation.createdAt,
        });
      }
    );

    await this.movimentationRepository.create(movimentations);

    await this.registerDateOnProject(movimentations);

    return right({ movimentations });
  }

  private async verifyResourcesId(
    transferMaterialUseCaseRequest: TransferMaterialUseCaseRequest[]
  ) {
    let containsIdError = false;
    let message;

    if (
      !(await this.verifyIfIdsExist(
        transferMaterialUseCaseRequest,
        "storekeeperId"
      ))
    ) {
      containsIdError = true;
      message = "pelo menos um dos storekeeperIds não encontrado";
    }

    if (
      !(await this.verifyIfIdsExist(
        transferMaterialUseCaseRequest,
        "materialId"
      ))
    ) {
      containsIdError = true;
      message = "pelo menos um dos materialIds não encontrado";
    }

    if (
      !(await this.verifyIfIdsExist(
        transferMaterialUseCaseRequest,
        "projectId"
      ))
    ) {
      containsIdError = true;
      message = "pelo menos um dos projectIds não encontrado";
    }

    if (
      !(await this.verifyIfIdsExist(transferMaterialUseCaseRequest, "baseId"))
    ) {
      containsIdError = true;
      message = "pelo menos um dos baseIds não encontrado";
    }

    return { containsIdError, message };
  }

  private async verifyIfIdsExist(
    transferMaterialUseCaseRequest: TransferMaterialUseCaseRequest[],
    key: keyof TransferMaterialUseCaseRequest
  ): Promise<boolean> {
    const uniqueValuesArray = this.uniqueValues(
      transferMaterialUseCaseRequest,
      key
    );

    let result: Array<UserEntities> | Material[] | Project[] | Base[] = [];

    switch (key) {
      case "storekeeperId":
        result = await this.userRepository.findByIds(uniqueValuesArray);
        break;
      case "materialId":
        result = await this.materialRepository.findByIds(uniqueValuesArray);
        this.materials = result;
        break;
      case "projectId":
        result = await this.projectRepository.findByIds(uniqueValuesArray);
        this.projects = result;
        break;
      case "baseId":
        result = await this.baseRepository.findByIds(uniqueValuesArray);
        break;
      default:
        result = [];
        break;
    }

    return uniqueValuesArray.length === result.length ? true : false;
  }

  private uniqueValues(
    transferMaterialUseCaseRequest: TransferMaterialUseCaseRequest[],
    key: keyof TransferMaterialUseCaseRequest
  ): string[] {
    return [
      ...new Set(
        transferMaterialUseCaseRequest.map((movimentation) =>
          String(movimentation[key])
        )
      ),
    ];
  }

  private verifyEquipmentDetails(
    transferMaterialUseCaseRequest: TransferMaterialUseCaseRequest[]
  ) {
    let containsEquipmentWithoutDetails = false;
    let messageEquipment = "";

    transferMaterialUseCaseRequest.map((request) => {
      const material = this.materials.find(
        (material) => material.id.toString() === request.materialId
      );

      if (
        material &&
        material.type === "EQUIPAMENTO" &&
        !request.ignoreValidations
      ) {
        const ciaCount = (request.observation.match(/CIA/gi) || []).length;

        if (!Number.isInteger(request.value)) {
          containsEquipmentWithoutDetails = true;
          messageEquipment += `O material ${material.code} é um equipamento e o valor movimentado tem que ser um valor inteiro.`;
        }
        if (ciaCount !== Math.abs(request.value)) {
          containsEquipmentWithoutDetails = true;
          messageEquipment += `O material ${
            material.code
          } é um equipamento e requer ${Math.abs(
            request.value
          )} número(s) de CIA na observação. Foram encontrados ${ciaCount}.`;
        }
      }
    });

    return { containsEquipmentWithoutDetails, messageEquipment };
  }

  private async registerDateOnProject(
    movimentations: Movimentation[]
  ): Promise<void> {
    const updatedProjects = this.projects.map((project) => {
      const movimentationMaxDate = new Date(
        new Date(
          Math.max(
            ...movimentations
              .filter((movimentation) => (movimentation.projectId = project.id))
              .map((movimentation) => movimentation.createdAt.getTime())
          )
        ).setMilliseconds(999)
      );

      const movimentationMinDate = new Date(
        new Date(
          Math.min(
            ...movimentations
              .filter((movimentation) => (movimentation.projectId = project.id))
              .map((movimentation) => movimentation.createdAt.getTime())
          )
        ).setMilliseconds(0)
      );

      if (project.firstMovimentationRegister) {
        project.lastMovimentationRegister = movimentationMaxDate;
      } else {
        project.firstMovimentationRegister = movimentationMinDate;
        project.lastMovimentationRegister = movimentationMaxDate;
      }
      return project;
    });
    await this.projectRepository.saveBulk(updatedProjects);
  }
}
