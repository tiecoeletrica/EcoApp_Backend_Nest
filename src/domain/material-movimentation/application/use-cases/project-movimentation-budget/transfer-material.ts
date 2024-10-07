import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { Movimentation } from "../../../enterprise/entities/movimentation";
import { MovimentationRepository } from "../../repositories/movimentation-repository";
import { UserRepository } from "../../repositories/user-repository";
import { MaterialRepository } from "../../repositories/material-repository";
import { ProjectRepository } from "../../repositories/project-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { Storekeeper } from "src/domain/material-movimentation/enterprise/entities/storekeeper";
import { Material } from "src/domain/material-movimentation/enterprise/entities/material";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { BaseRepository } from "../../repositories/base-repository";
import { Base } from "src/domain/material-movimentation/enterprise/entities/base";
import { Estimator } from "src/domain/material-movimentation/enterprise/entities/estimator";

interface TransferMaterialUseCaseRequest {
  storekeeperId: string;
  materialId: string;
  projectId: string;
  observation: string;
  baseId: string;
  value: number;
}

type TransferMaterialResponse = Eihter<
  ResourceNotFoundError,
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

  async execute(
    transferMaterialUseCaseRequest: TransferMaterialUseCaseRequest[]
  ): Promise<TransferMaterialResponse> {
    const { containsIdError, message } = await this.verifyResourcesId(
      transferMaterialUseCaseRequest
    );

    if (containsIdError) return left(new ResourceNotFoundError(message));

    const movimentations = transferMaterialUseCaseRequest.map(
      (movimentation) => {
        return Movimentation.create({
          projectId: new UniqueEntityID(movimentation.projectId),
          materialId: new UniqueEntityID(movimentation.materialId),
          storekeeperId: new UniqueEntityID(movimentation.storekeeperId),
          observation: movimentation.observation,
          baseId: new UniqueEntityID(movimentation.baseId),
          value: movimentation.value,
        });
      }
    );

    await this.movimentationRepository.create(movimentations);

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

    let result:
      | Array<Estimator | Storekeeper>
      | Material[]
      | Project[]
      | Base[] = [];

    switch (key) {
      case "storekeeperId":
        result = await this.userRepository.findByIds(uniqueValuesArray);
        break;
      case "materialId":
        result = await this.materialRepository.findByIds(uniqueValuesArray);
        break;
      case "projectId":
        result = await this.projectRepository.findByIds(uniqueValuesArray);
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
}
