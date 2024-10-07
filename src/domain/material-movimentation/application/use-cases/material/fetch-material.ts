import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { Material } from "../../../enterprise/entities/material";
import { MaterialRepository } from "../../repositories/material-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { PaginationParamsResponse } from "src/core/repositories/pagination-params";

interface FetchMaterialUseCaseRequest {
  page: number;
  type?: string;
  contractId: string;
}

type FetchMaterialUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    materials: Material[];
    pagination: PaginationParamsResponse;
  }
>;

@Injectable()
export class FetchMaterialUseCase {
  constructor(private materialRepository: MaterialRepository) {}

  async execute({
    page,
    type,
    contractId,
  }: FetchMaterialUseCaseRequest): Promise<FetchMaterialUseCaseResponse> {
    const { materials, pagination } = await this.materialRepository.findMany(
      {
        page,
      },
      contractId,
      type
    );

    if (!materials.length)
      return left(new ResourceNotFoundError("Pesquisa sem resultados"));

    return right({ materials, pagination });
  }
}
