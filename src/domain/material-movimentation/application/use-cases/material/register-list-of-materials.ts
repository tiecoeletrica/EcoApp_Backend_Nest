import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { MaterialRepository } from "../../repositories/material-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { Material } from "src/domain/material-movimentation/enterprise/entities/material";
import { ContractRepository } from "../../repositories/contract-repository";
import { ResourceAlreadyRegisteredError } from "../errors/resource-already-registered-error";
import { Contract } from "src/domain/material-movimentation/enterprise/entities/contract";

interface RegisterListOfMaterialsUseCaseRequest {
  code: number;
  description: string;
  unit: string;
  type: string;
  contractId: string;
}

type RegisterListOfMaterialsResponse = Eihter<
  ResourceAlreadyRegisteredError | ResourceNotFoundError,
  {
    materials: Material[];
  }
>;

@Injectable()
export class RegisterListOfMaterialsUseCase {
  constructor(
    private materialRepository: MaterialRepository,
    private contractRepository: ContractRepository
  ) {}

  private codes: string = "";

  async execute(
    resquestUseCase: RegisterListOfMaterialsUseCaseRequest[]
  ): Promise<RegisterListOfMaterialsResponse> {
    this.codes = "";

    const { containsIdError, message } = await this.verifyResourcesId(
      resquestUseCase
    );

    if (containsIdError) {
      if (!message.includes("Código(s)"))
        return left(new ResourceNotFoundError(message));
      else return left(new ResourceAlreadyRegisteredError(message));
    }

    const materials = resquestUseCase.map((material) => {
      return Material.create({
        code: material.code,
        description: material.description,
        unit: material.unit,
        type: material.type,
        contractId: new UniqueEntityID(material.contractId),
      });
    });

    await this.materialRepository.create(materials);

    return right({ materials });
  }

  private async verifyResourcesId(
    resquestUseCase: RegisterListOfMaterialsUseCaseRequest[]
  ) {
    let containsIdError = false;
    let message;

    if (!(await this.verifyIfIdsExist(resquestUseCase, "code"))) {
      containsIdError = true;
      message = `Código(s) ${this.codes} já cadastrado(s)`;
    }

    if (!(await this.verifyIfIdsExist(resquestUseCase, "contractId"))) {
      containsIdError = true;
      message = "pelo menos um dos contractIds não encontrado";
    }

    return { containsIdError, message };
  }

  private async verifyIfIdsExist(
    resquestUseCase: RegisterListOfMaterialsUseCaseRequest[],
    key: keyof RegisterListOfMaterialsUseCaseRequest
  ): Promise<boolean> {
    const uniqueValuesArray = this.uniqueValues(resquestUseCase, key);

    let result: Material[] | Contract[] = [];

    let uniqueMaterials: { code: number; contractId: string }[] = [];

    switch (key) {
      case "code":
        uniqueMaterials = uniqueValuesArray.map((unique) => {
          return {
            code: Number(unique),
            contractId: resquestUseCase.find(
              (request) => request.code === Number(unique)
            )!.contractId,
          };
        });

        result = await this.materialRepository.findByCodes(uniqueMaterials);
        result.map((material, index) => {
          this.codes += `${material.code.toString()}`;
          if (index + 1 !== result.length) this.codes += ", ";
        });
        break;
      case "contractId":
        result = await this.contractRepository.findByIds(uniqueValuesArray);
        break;
      default:
        result = [];
        break;
    }
    if (key === "contractId")
      return uniqueValuesArray.length === result.length ? true : false;
    if (key === "code") return result.length === 0 ? true : false;
    else return false;
  }

  private uniqueValues(
    resquestUseCase: RegisterListOfMaterialsUseCaseRequest[],
    key: keyof RegisterListOfMaterialsUseCaseRequest
  ): string[] {
    return [
      ...new Set(
        resquestUseCase.map((movimentation) => String(movimentation[key]))
      ),
    ];
  }
}
