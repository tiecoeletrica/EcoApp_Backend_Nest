import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { Material } from "../../../enterprise/entities/material";
import { MaterialRepository } from "../../repositories/material-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

interface FetchAllMaterialUseCaseRequest {
  type?: string;
  contractId: string;
}

type FetchAllMaterialUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    materials: Material[];
  }
>;

@Injectable()
export class FetchAllMaterialUseCase {
  constructor(private materialRepository: MaterialRepository) {}

  async execute({
    type,
    contractId,
  }: FetchAllMaterialUseCaseRequest): Promise<FetchAllMaterialUseCaseResponse> {
    const materials = await this.materialRepository.findManyAll(
      contractId,
      type
    );

    if (!materials.length)
      return left(new ResourceNotFoundError("Pesquisa sem resultados"));

    return right({ materials });
  }
}
