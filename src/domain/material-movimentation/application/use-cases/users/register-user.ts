import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { HashGenerator } from "../../cryptography/hash-generator";
import { UserRepository } from "../../repositories/user-repository";
import { BaseRepository } from "../../repositories/base-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { UserType } from "src/core/types/user-type";
import { WrongTypeError } from "../errors/wrong-type";
import { Storekeeper } from "src/domain/material-movimentation/enterprise/entities/storekeeper";
import { Estimator } from "src/domain/material-movimentation/enterprise/entities/estimator";
import { ContractRepository } from "../../repositories/contract-repository";
import { NotValidError } from "../errors/not-valid-error";
import { ResourceAlreadyRegisteredError } from "../errors/resource-already-registered-error";
import { Supervisor } from "src/domain/material-movimentation/enterprise/entities/supervisor";
import { Administrator } from "src/domain/material-movimentation/enterprise/entities/Administrator";

interface RegisterUserUseCaseRequest {
  name: string;
  email: string;
  cpf: string;
  type: string;
  password: string;
  baseId: string;
  contractId: string;
}

type RegisterUserResponse = Eihter<
  | ResourceNotFoundError
  | WrongTypeError
  | NotValidError
  | ResourceAlreadyRegisteredError,
  {
    user: Storekeeper | Estimator | Supervisor | Administrator;
  }
>;

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashGenerator: HashGenerator,
    private baseRepository: BaseRepository,
    private contractRepository: ContractRepository
  ) {}

  async execute({
    name,
    email,
    cpf,
    type,
    baseId,
    contractId,
    password,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserResponse> {
    let user: Storekeeper | Estimator | Supervisor | Administrator;

    const base = await this.baseRepository.findById(baseId);
    if (!base) return left(new ResourceNotFoundError("baseId não encontrado"));

    const contract = await this.contractRepository.findById(contractId);
    if (!contract)
      return left(new ResourceNotFoundError("contractId não encontrado"));

    if (base.contractId.toString() !== contractId)
      return left(
        new NotValidError(
          `A base ${base.baseName} não pertence ao contrato ${contract.contractName}`
        )
      );

    if (!this.isUserType(type)) return left(new WrongTypeError());

    const searchUser = await this.userRepository.findByEmail(email);
    if (searchUser) return left(new ResourceAlreadyRegisteredError());

    if (type === "Orçamentista")
      user = Estimator.create({
        name,
        email,
        cpf,
        type,
        baseId: new UniqueEntityID(baseId),
        contractId: new UniqueEntityID(contractId),
        password: await this.hashGenerator.hash(password),
      });
    else if (type === "Supervisor")
      user = Supervisor.create({
        name,
        email,
        cpf,
        type,
        baseId: new UniqueEntityID(baseId),
        contractId: new UniqueEntityID(contractId),
        password: await this.hashGenerator.hash(password),
      });
    else if (type === "Administrador")
      user = Administrator.create({
        name,
        email,
        cpf,
        type,
        baseId: new UniqueEntityID(baseId),
        contractId: new UniqueEntityID(contractId),
        password: await this.hashGenerator.hash(password),
      });
    else
      user = Storekeeper.create({
        name,
        email,
        cpf,
        type,
        baseId: new UniqueEntityID(baseId),
        contractId: new UniqueEntityID(contractId),
        password: await this.hashGenerator.hash(password),
      });

    await this.userRepository.create(user);

    return right({ user });
  }

  private isUserType(type: string): type is UserType {
    return [
      "Administrador",
      "Almoxarife",
      "Almoxarife Líder",
      "Orçamentista",
      "Supervisor",
    ].includes(type as UserType);
  }
}
