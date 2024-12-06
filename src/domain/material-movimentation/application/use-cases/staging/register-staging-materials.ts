import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { Staging } from "../../../enterprise/entities/staging";
import { StagingRepository } from "../../repositories/staging-repository";
import { ResourceAlreadyRegisteredError } from "../../../../../core/errors/errors/resource-already-registered-error";
import { BaseRepository } from "../../repositories/base-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { ProjectRepository } from "../../repositories/project-repository";
import { UserRepository } from "../../repositories/user-repository";
import { StagingMaterial } from "src/domain/material-movimentation/enterprise/entities/staging-material";
import { Material } from "src/domain/material-movimentation/enterprise/entities/material";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { MaterialRepository } from "../../repositories/material-repository";
import { StagingMaterialRepository } from "../../repositories/staging-material-repository";

interface RegisterStagingMaterialsRequest {
  stagingId: string;
  projectId: string;
  materialId: string;
  value: number;
}

type RegisterStagingMaterialsResponse = Eihter<
  ResourceNotFoundError,
  {
    stagingMaterials: StagingMaterial[];
  }
>;

@Injectable()
export class RegisterStagingMaterialsUseCase {
  constructor(
    private stagingMaterialRepository: StagingMaterialRepository,
    private stagingRepository: StagingRepository,
    private projectRepository: ProjectRepository,
    private materialRepository: MaterialRepository
  ) {}

  async execute(
    RegisterStagingMaterialsRequest: RegisterStagingMaterialsRequest[]
  ): Promise<RegisterStagingMaterialsResponse> {
    const { containsIdError, message } = await this.verifyResourcesId(
      RegisterStagingMaterialsRequest
    );

    if (containsIdError) return left(new ResourceNotFoundError(message));

    let stagingMaterials: StagingMaterial[] = [];

    RegisterStagingMaterialsRequest.map((request) => {
      stagingMaterials.push(
        StagingMaterial.create({
          materialId: new UniqueEntityID(request.materialId),
          projectId: new UniqueEntityID(request.projectId),
          stagingId: new UniqueEntityID(request.stagingId),
          value: request.value,
        })
      );
    });

    await this.stagingMaterialRepository.create(stagingMaterials);

    return right({ stagingMaterials });
  }

  private async verifyResourcesId(
    transferMaterialUseCaseRequest: RegisterStagingMaterialsRequest[]
  ) {
    let containsIdError = false;
    let message;

    if (
      !(await this.verifyIfIdsExist(
        transferMaterialUseCaseRequest,
        "stagingId"
      ))
    ) {
      containsIdError = true;
      message = "O Id de separação não foi encontrado";
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

    return { containsIdError, message };
  }

  private async verifyIfIdsExist(
    transferMaterialUseCaseRequest: RegisterStagingMaterialsRequest[],
    key: keyof RegisterStagingMaterialsRequest
  ): Promise<boolean> {
    const uniqueValuesArray = this.uniqueValues(
      transferMaterialUseCaseRequest,
      key
    );

    let result: Staging[] | Material[] | Project[] = [];

    switch (key) {
      case "stagingId":
        result = await this.stagingRepository.findByIds(uniqueValuesArray);
        break;
      case "materialId":
        result = await this.materialRepository.findByIds(uniqueValuesArray);
        break;
      case "projectId":
        result = await this.projectRepository.findByIds(uniqueValuesArray);
        break;
      default:
        result = [];
        break;
    }

    return uniqueValuesArray.length === result.length ? true : false;
  }

  private uniqueValues(
    registerStagingMaterialsRequest: RegisterStagingMaterialsRequest[],
    key: keyof RegisterStagingMaterialsRequest
  ): string[] {
    return [
      ...new Set(
        registerStagingMaterialsRequest.map((movimentation) =>
          String(movimentation[key])
        )
      ),
    ];
  }
}
