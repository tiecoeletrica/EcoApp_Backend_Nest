import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { BaseRepository } from "../../repositories/base-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { BaseWithContract } from "src/domain/material-movimentation/enterprise/entities/value-objects/base-with-contract";
import { PaginationParamsResponse } from "src/core/repositories/pagination-params";

interface FetchBaseUseCaseRequest {
  page: number;
  userType: string;
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
    userType,
  }: FetchBaseUseCaseRequest): Promise<FetchBaseUseCaseResponse> {
    const { bases, pagination } =
      await this.baseRepository.findManyWithContract({
        page,
      });

    if (!bases.length)
      return left(new ResourceNotFoundError("Pesquisa sem resultados"));

    if (userType !== "Administrador")
      return right({
        bases: bases.filter(
          (base) =>
            base.contract.id.toString() !==
            "8525856b-9d1f-47be-819c-8b11157db384"
        ),
        pagination,
      });

    return right({ bases, pagination });
  }
}
