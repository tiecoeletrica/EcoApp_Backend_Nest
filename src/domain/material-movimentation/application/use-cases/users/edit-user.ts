import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { UserRepository } from "../../repositories/user-repository";
import { NotAllowedError } from "../errors/not-allowed-error";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { HashGenerator } from "../../cryptography/hash-generator";
import { BaseRepository } from "../../repositories/base-repository";
import { UserType } from "src/core/types/user-type";
import { Base } from "src/domain/material-movimentation/enterprise/entities/base";
import { ContractRepository } from "../../repositories/contract-repository";
import { Contract } from "src/domain/material-movimentation/enterprise/entities/contract";
import { NotValidError } from "../errors/not-valid-error";

interface EditUserUseCaseRequest {
  userId: string;
  authorId: string;
  type?: string;
  baseId?: string;
  contractId?: string;
  status?: string;
  password?: string;
}

type EditUserResponse = Eihter<
  ResourceNotFoundError | NotAllowedError | NotValidError,
  null
>;

@Injectable()
export class EditUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashGenerator: HashGenerator,
    private baseRepository: BaseRepository,
    private contractRepository: ContractRepository
  ) {}

  async execute({
    userId,
    authorId,
    type,
    baseId,
    contractId,
    status,
    password,
  }: EditUserUseCaseRequest): Promise<EditUserResponse> {
    if (!password && !status && !contractId && !baseId && !type)
      return left(
        new ResourceNotFoundError("Nenhum parâmetro para edição enviado")
      );

    const users = await this.userRepository.findByIds([authorId, userId]);
    const user = users.find((item) => item.id.toString() === userId);
    const author = users.find((item) => item.id.toString() === authorId);

    if (!author)
      return left(new ResourceNotFoundError("Id do autor não encontrado"));
    if (!user)
      return left(new ResourceNotFoundError("Id do usuário não encontrado"));

    if (author.type != "Administrador" && authorId !== user.id.toString())
      return left(new NotAllowedError());

    let base: Base | null = null;
    if (baseId) {
      base = await this.baseRepository.findById(baseId);
      if (!base)
        return left(new ResourceNotFoundError("baseId não encontrado"));
    }

    let contract: Contract | null = null;
    if (contractId) {
      contract = await this.contractRepository.findById(contractId);
      if (!contract)
        return left(new ResourceNotFoundError("contractId não encontrado"));
    }

    if (base && contract)
      if (base.contractId.toString() !== contractId)
        return left(
          new NotValidError(
            "A base informada não pertence ao contrato informado"
          )
        );

    user.type = (type ?? user.type) as UserType;
    user.baseId =
      baseId === undefined ? user.baseId : new UniqueEntityID(baseId);
    user.contractId =
      contractId === undefined
        ? user.contractId
        : new UniqueEntityID(contractId);
    user.status = status ?? user.status;
    user.password =
      password === undefined
        ? user.password
        : await this.hashGenerator.hash(password);

    if (base)
      if (base.contractId.toString() !== user.contractId.toString())
        return left(
          new NotValidError(
            "A base informada não pertence ao contrato do usuário"
          )
        );

    await this.userRepository.save(user);

    return right(null);
  }
}
