import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { Contract } from "../../../enterprise/entities/contract";
import { ContractRepository } from "../../repositories/contract-repository";
import { ResourceAlreadyRegisteredError } from "../../../../../core/errors/errors/resource-already-registered-error";

interface RegisterContractUseCaseRequest {
  contractName: string;
}

type RegisterContractResponse = Eihter<
  ResourceAlreadyRegisteredError,
  {
    contract: Contract;
  }
>;

@Injectable()
export class RegisterContractUseCase {
  constructor(private contractRepository: ContractRepository) {}

  async execute({
    contractName,
  }: RegisterContractUseCaseRequest): Promise<RegisterContractResponse> {
    const contractSearch = await this.contractRepository.findByContractName(
      contractName
    );
    if (contractSearch)
      return left(
        new ResourceAlreadyRegisteredError(
          `Já existe um contrato com o nome ${contractName}`
        )
      );

    const contract = Contract.create({
      contractName,
    });

    await this.contractRepository.create(contract);

    return right({ contract });
  }
}
