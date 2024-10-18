import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { Material } from "../../../enterprise/entities/material";
import { MaterialRepository } from "../../repositories/material-repository";
import { ResourceAlreadyRegisteredError } from "../errors/resource-already-registered-error";
import { ContractRepository } from "../../repositories/contract-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

interface CreateMaterialUseCaseRequest {
  code: number;
  description: string;
  unit: string;
  type: string;
  contractId: string;
}

type CreateMaterialResponse = Eihter<
  ResourceAlreadyRegisteredError | ResourceNotFoundError,
  {
    material: Material;
  }
>;

@Injectable()
export class CreateMaterialUseCase {
  constructor(
    private materialRepository: MaterialRepository,
    private contractRepository: ContractRepository
  ) {}

  async execute({
    code,
    description,
    unit,
    type,
    contractId,
  }: CreateMaterialUseCaseRequest): Promise<CreateMaterialResponse> {
    const base = await this.contractRepository.findById(contractId);
    if (!base)
      return left(new ResourceNotFoundError("contractId não encontrado"));

    const materialSearch = await this.materialRepository.findByCode(
      code,
      contractId
    );

    if (materialSearch)
      return left(
        new ResourceAlreadyRegisteredError(
          `Código ${code} já cadastrado nesse contrato`
        )
      );

    const material = Material.create({
      code,
      description,
      unit,
      type,
      contractId: new UniqueEntityID(contractId),
    });

    await this.materialRepository.create(material);

    return right({ material });
  }
}
