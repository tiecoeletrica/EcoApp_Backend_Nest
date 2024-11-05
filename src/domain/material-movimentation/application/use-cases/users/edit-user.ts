import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { UserRepository } from "../../repositories/user-repository";
import { NotAllowedError } from "../errors/not-allowed-error";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { HashGenerator } from "../../cryptography/hash-generator";
import { BaseRepository } from "../../repositories/base-repository";
import { UserEntities, UserType } from "src/core/types/user-type";
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

  private base;
  private contract;
  private user;
  private author;

  async execute(request: EditUserUseCaseRequest): Promise<EditUserResponse> {
    this.base = undefined;
    this.contract = undefined;
    this.user = undefined;
    this.author = undefined;

    const { userId, authorId, type, baseId, contractId, status, password } =
      request;

    if (this.noParametersToEdit(request)) {
      return left(
        new ResourceNotFoundError("Nenhum parâmetro para edição enviado")
      );
    }

    const usersResult = await this.findUsers(userId, authorId);
    if (usersResult.isLeft()) return usersResult;

    const user = this.user;
    const author = this.author;

    const permissionCheck = this.checkPermissions(
      author,
      user,
      authorId,
      type,
      password
    );
    if (permissionCheck.isLeft()) return permissionCheck;

    const baseAndContractResult = await this.validateBaseAndContract(
      baseId,
      contractId
    );
    if (baseAndContractResult.isLeft()) return baseAndContractResult;
    const base = this.base;
    const contract = this.contract;

    if (base && contract) {
      const baseContractCheck = this.checkBaseContract(base, contract);
      if (baseContractCheck.isLeft()) return baseContractCheck;
    }

    if (base) {
      const userBaseCheck = this.checkUserBase(user, base);
      if (userBaseCheck.isLeft()) return userBaseCheck;
    }

    const updatedUser = await this.updateUserFields(
      user,
      type,
      baseId,
      contractId,
      status,
      password
    );

    await this.userRepository.save(updatedUser);

    return right(null);
  }

  private noParametersToEdit(request: EditUserUseCaseRequest): boolean {
    return (
      !request.password &&
      !request.status &&
      !request.contractId &&
      !request.baseId &&
      !request.type
    );
  }

  private async findUsers(
    userId: string,
    authorId: string
  ): Promise<Eihter<ResourceNotFoundError, null>> {
    const users = await this.userRepository.findByIds([authorId, userId]);
    const user = users.find((item) => item.id.toString() === userId);
    const author = users.find((item) => item.id.toString() === authorId);

    if (!author)
      return left(new ResourceNotFoundError("Id do autor não encontrado"));
    if (!user)
      return left(new ResourceNotFoundError("Id do usuário não encontrado"));

    this.user = user;
    this.author = author;

    return right(null);
  }

  private checkPermissions(
    author: UserEntities,
    user: UserEntities,
    authorId: string,
    type?: string,
    password?: string
  ): Eihter<NotAllowedError, null> {
    const allowedToEditRoles = ["Almoxarife Líder", "Administrador"];

    if (
      !allowedToEditRoles.includes(author.type) &&
      authorId !== user.id.toString()
    ) {
      return left(
        new NotAllowedError(
          "Você não tem permissão para editar outros usuários"
        )
      );
    }

    if (
      author.type !== "Administrador" &&
      authorId !== user.id.toString() &&
      password
    ) {
      return left(
        new NotAllowedError(
          "Somente Administradores podem trocar a senha de outro usuário"
        )
      );
    }

    if (author.type !== "Administrador" && type === "Administrador") {
      return left(
        new NotAllowedError(
          "Somente Administradores podem trocar o tipo de um usuário para Administrador"
        )
      );
    }

    return right(null);
  }

  private async validateBaseAndContract(
    baseId?: string,
    contractId?: string
  ): Promise<Eihter<ResourceNotFoundError, null>> {
    let base: Base | null = null;
    let contract: Contract | null = null;

    if (baseId) {
      base = await this.baseRepository.findById(baseId);
      if (!base)
        return left(new ResourceNotFoundError("baseId não encontrado"));
    }

    if (contractId) {
      contract = await this.contractRepository.findById(contractId);
      if (!contract)
        return left(new ResourceNotFoundError("contractId não encontrado"));
    }

    this.base = base;
    this.contract = contract;

    return right(null);
  }

  private checkBaseContract(
    base: Base,
    contract: Contract
  ): Eihter<NotValidError, null> {
    if (base.contractId.toString() !== contract.id.toString()) {
      return left(
        new NotValidError(
          `A base ${base.baseName} não pertence ao contrato ${contract.contractName}`
        )
      );
    }
    return right(null);
  }

  private async updateUserFields(
    user: UserEntities,
    type?: string,
    baseId?: string,
    contractId?: string,
    status?: string,
    password?: string
  ): Promise<UserEntities> {
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
    return user;
  }

  private checkUserBase(
    user: UserEntities,
    base: Base
  ): Eihter<NotValidError, null> {
    if (base.contractId.toString() !== user.contractId.toString()) {
      return left(
        new NotValidError(
          `A base ${base.baseName} não pertence ao contrato do usuário`
        )
      );
    }
    return right(null);
  }
}
