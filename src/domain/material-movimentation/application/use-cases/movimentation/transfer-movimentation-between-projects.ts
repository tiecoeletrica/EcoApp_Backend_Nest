import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { Movimentation } from "../../../enterprise/entities/movimentation";
import { MovimentationRepository } from "../../repositories/movimentation-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { MaterialRepository } from "../../repositories/material-repository";
import { ProjectRepository } from "../../repositories/project-repository";
import { BaseRepository } from "../../repositories/base-repository";
import { Material } from "src/domain/material-movimentation/enterprise/entities/material";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { Base } from "src/domain/material-movimentation/enterprise/entities/base";
import { UserRepository } from "../../repositories/user-repository";
import { UserEntities } from "src/core/types/user-type";

interface TransferMovimentationBetweenProjectsUseCaseRequest {
  storekeeperId: string;
  materialId: string;
  projectIdOut: string;
  projectIdIn: string;
  observation: string;
  baseId: string;
  value: number;
}

type TransferMovimentationBetweenProjectsResponse = Eihter<
  ResourceNotFoundError,
  {
    movimentationIn: Movimentation[];
    movimentationOut: Movimentation[];
  }
>;

interface createMovimentationArraysResponse {
  concatMovimentations: Movimentation[];
  movimentationIn: Movimentation[];
  movimentationOut: Movimentation[];
}

@Injectable()
export class TransferMovimentationBetweenProjectsUseCase {
  constructor(
    private movimentationRepository: MovimentationRepository,
    private userRepository: UserRepository,
    private materialRepository: MaterialRepository,
    private projectRepository: ProjectRepository,
    private baseRepository: BaseRepository
  ) {}

  private codesWithWrongQtd: string = "";
  private materials: Material[] = [];

  async execute(
    transferMovimentationUseCaseRequest: TransferMovimentationBetweenProjectsUseCaseRequest[]
  ): Promise<TransferMovimentationBetweenProjectsResponse> {
    this.codesWithWrongQtd = "";
    this.materials = [];

    const { containsIdError, message } = await this.verifyResourcesId(
      transferMovimentationUseCaseRequest
    );

    if (containsIdError) return left(new ResourceNotFoundError(message));

    const containsQtdError = await this.verifyQtdToTransfer(
      transferMovimentationUseCaseRequest
    );

    if (containsQtdError)
      return left(
        new ResourceNotFoundError(
          `O(s) material(is) ${this.codesWithWrongQtd} possue(m) valor inferior à quantidade enviada do projeto de origem`
        )
      );

    const { concatMovimentations, movimentationIn, movimentationOut } =
      this.createMovimentationArrays(transferMovimentationUseCaseRequest);

    await this.movimentationRepository.create(concatMovimentations);

    return right({ movimentationIn, movimentationOut });
  }

  private async verifyQtdToTransfer(
    transferMovimentationUseCaseRequest: TransferMovimentationBetweenProjectsUseCaseRequest[]
  ): Promise<boolean> {
    let movimentationVerificationOut: Movimentation[] = [];
    let countErrors = 0;

    //create array with unique values os projectsId
    const projectsId = [
      ...new Set(
        transferMovimentationUseCaseRequest.map(
          (transfer) => transfer.projectIdOut
        )
      ),
    ];

    // searhc all movimentation of the informed projects and insert on movimentationRepository
    for (const project of projectsId) {
      const movimentationProject =
        await this.movimentationRepository.findByProject(project);
      movimentationVerificationOut =
        movimentationVerificationOut.concat(movimentationProject);
    }

    // verify if in any case of transference there're enough materials in the origin project
    transferMovimentationUseCaseRequest.forEach((request) => {
      const valueSumRepository = movimentationVerificationOut
        .filter(
          (movRepo) =>
            movRepo.projectId.toString() === request.projectIdOut &&
            movRepo.materialId.toString() === request.materialId
        )
        .reduce((a, b) => a + b.value, 0);

      // counter of cases that there're enough materials in the origin project
      if (valueSumRepository < request.value) {
        countErrors += 1;
        const material = this.materials.find(
          (item) => item.id.toString() === request.materialId
        );
        this.codesWithWrongQtd += `${material?.code} ,`;
      }
    });

    if (this.codesWithWrongQtd.length > 1)
      this.codesWithWrongQtd = this.codesWithWrongQtd.substring(
        0,
        this.codesWithWrongQtd.length - 2
      );

    return countErrors > 0 ? true : false;
  }

  private createMovimentationArrays(
    transferMovimentationUseCaseRequest: TransferMovimentationBetweenProjectsUseCaseRequest[]
  ): createMovimentationArraysResponse {
    let movimentationIn: Movimentation[] = [];
    let movimentationOut: Movimentation[] = [];

    transferMovimentationUseCaseRequest.map(async (transfer) => {
      movimentationOut.push(
        Movimentation.create({
          projectId: new UniqueEntityID(transfer.projectIdOut),
          materialId: new UniqueEntityID(transfer.materialId),
          storekeeperId: new UniqueEntityID(transfer.storekeeperId),
          observation: transfer.observation,
          baseId: new UniqueEntityID(transfer.baseId),
          value: -Math.abs(transfer.value),
        })
      );

      movimentationIn.push(
        Movimentation.create({
          projectId: new UniqueEntityID(transfer.projectIdIn),
          materialId: new UniqueEntityID(transfer.materialId),
          storekeeperId: new UniqueEntityID(transfer.storekeeperId),
          observation: transfer.observation,
          baseId: new UniqueEntityID(transfer.baseId),
          value: Math.abs(transfer.value),
        })
      );
    });

    const concatMovimentations = movimentationOut.concat(movimentationIn);

    return { concatMovimentations, movimentationIn, movimentationOut };
  }

  private async verifyResourcesId(
    transferMovimentationUseCaseRequest: TransferMovimentationBetweenProjectsUseCaseRequest[]
  ) {
    let containsIdError = false;
    let message;

    if (
      !(await this.verifyIfIdsExist(
        transferMovimentationUseCaseRequest,
        "storekeeperId"
      ))
    ) {
      containsIdError = true;
      message = "pelo menos um dos storekeeperIds não encontrado";
    }

    if (
      !(await this.verifyIfIdsExist(
        transferMovimentationUseCaseRequest,
        "materialId"
      ))
    ) {
      containsIdError = true;
      message = "pelo menos um dos materialIds não encontrado";
    }

    if (
      !(await this.verifyIfIdsExist(
        transferMovimentationUseCaseRequest,
        "projectIdIn"
      ))
    ) {
      containsIdError = true;
      message = "pelo menos um dos projectIds não encontrado";
    }

    if (
      !(await this.verifyIfIdsExist(
        transferMovimentationUseCaseRequest,
        "baseId"
      ))
    ) {
      containsIdError = true;
      message = "pelo menos um dos baseIds não encontrado";
    }

    return { containsIdError, message };
  }

  private async verifyIfIdsExist(
    transferMovimentationUseCaseRequest: TransferMovimentationBetweenProjectsUseCaseRequest[],
    key: keyof TransferMovimentationBetweenProjectsUseCaseRequest
  ): Promise<boolean> {
    let uniqueValuesArray = this.uniqueValues(
      transferMovimentationUseCaseRequest,
      key
    );

    if (key === "projectIdIn") {
      uniqueValuesArray = uniqueValuesArray.concat(
        this.uniqueValues(transferMovimentationUseCaseRequest, "projectIdOut")
      );
    }

    let result:
      | Array<UserEntities>
      | Material[]
      | Project[]
      | Base[] = [];

    switch (key) {
      case "storekeeperId":
        result = await this.userRepository.findByIds(uniqueValuesArray);
        break;
      case "materialId":
        result = await this.materialRepository.findByIds(uniqueValuesArray);
        this.materials = result;
        break;
      case "projectIdIn":
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
    transferMovimentationUseCaseRequest: TransferMovimentationBetweenProjectsUseCaseRequest[],
    key: keyof TransferMovimentationBetweenProjectsUseCaseRequest
  ): string[] {
    return [
      ...new Set(
        transferMovimentationUseCaseRequest.map((movimentation) =>
          String(movimentation[key])
        )
      ),
    ];
  }
}
