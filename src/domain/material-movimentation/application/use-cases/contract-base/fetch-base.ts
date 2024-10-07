import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { BaseRepository } from "../../repositories/base-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { BaseWithContract } from "src/domain/material-movimentation/enterprise/entities/value-objects/base-with-contract";
import { PaginationParamsResponse } from "src/core/repositories/pagination-params";

interface FetchBaseUseCaseRequest {
  page: number;
}

type FetchBaseUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    bases: BaseWithContract[];
    pagination: PaginationParamsResponse;
  }
>;

@Injectable()
export class FetchBaseUseCase {
  constructor(private baseRepository: BaseRepository) {}

  async execute({
    page,
  }: FetchBaseUseCaseRequest): Promise<FetchBaseUseCaseResponse> {
    const { bases, pagination } =
      await this.baseRepository.findManyWithContract({
        page,
      });

    if (!bases.length)
      return left(new ResourceNotFoundError("Pesquisa sem resultados"));

    return right({ bases, pagination });
  }
}
