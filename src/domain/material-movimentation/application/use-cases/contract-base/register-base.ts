import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { Base } from "../../../enterprise/entities/base";
import { BaseRepository } from "../../repositories/base-repository";
import { ResourceAlreadyRegisteredError } from "../errors/resource-already-registered-error";
import { ContractRepository } from "../../repositories/contract-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

interface RegisterBaseUseCaseRequest {
  baseName: string;
  contractId: string;
}

type RegisterBaseResponse = Eihter<
  ResourceAlreadyRegisteredError | ResourceNotFoundError,
  {
    base: Base;
  }
>;

@Injectable()
export class RegisterBaseUseCase {
  constructor(
    private baseRepository: BaseRepository,
    private contractRepository: ContractRepository
  ) {}

  async execute({
    baseName,
    contractId,
  }: RegisterBaseUseCaseRequest): Promise<RegisterBaseResponse> {
    const contract = await this.contractRepository.findById(contractId);
    if (!contract)
      return left(new ResourceNotFoundError("contractId não encontrado"));

    const baseSearch = await this.baseRepository.findByBaseName(baseName);

    if (baseSearch)
      return left(
        new ResourceAlreadyRegisteredError(
          `Já existe uma base com o nome ${baseName}`
        )
      );

    const base = Base.create({
      baseName,
      contractId: new UniqueEntityID(contractId),
    });

    await this.baseRepository.create(base);

    return right({ base });
  }
}
