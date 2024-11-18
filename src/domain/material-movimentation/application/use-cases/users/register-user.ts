import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { HashGenerator } from "../../cryptography/hash-generator";
import { UserRepository } from "../../repositories/user-repository";
import { BaseRepository } from "../../repositories/base-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { UserEntities, UserType } from "src/core/types/user-type";
import { WrongTypeError } from "../../../../../core/errors/errors/wrong-type";
import { Storekeeper } from "src/domain/material-movimentation/enterprise/entities/storekeeper";
import { Estimator } from "src/domain/material-movimentation/enterprise/entities/estimator";
import { ContractRepository } from "../../repositories/contract-repository";
import { NotValidError } from "../../../../../core/errors/errors/not-valid-error";
import { ResourceAlreadyRegisteredError } from "../../../../../core/errors/errors/resource-already-registered-error";
import { Supervisor } from "src/domain/material-movimentation/enterprise/entities/supervisor";
import { Administrator } from "src/domain/material-movimentation/enterprise/entities/administrator";
import { NotAllowedError } from "../../../../../core/errors/errors/not-allowed-error";

interface RegisterUserUseCaseRequest {
  authorType: string;
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
  | ResourceAlreadyRegisteredError
  | NotAllowedError,
  {
    user: UserEntities;
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
    authorType,
    name,
    email,
    cpf,
    type,
    baseId,
    contractId,
    password,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserResponse> {
    let user: UserEntities;

    const allowedToEditRoles = ["Almoxarife Líder", "Administrador"];

    if (!allowedToEditRoles.includes(authorType))
      return left(
        new NotAllowedError("Você não tem permissão para criar novos usuários")
      );

    if (authorType !== "Administrador" && type === "Administrador")
      return left(
        new NotAllowedError(
          "Você não tem permissão para criar usuários Administradores"
        )
      );

    if (this.verifyCpf(cpf))
      return left(new NotValidError("O CPF informado não é válido"));

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
    if (searchUser)
      return left(
        new ResourceAlreadyRegisteredError(
          `O usuário com email '${searchUser.email}' já foi cadastrado`
        )
      );

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

  private verifyCpf(cpf: string): boolean {
    const arrayOfCpfNumbers = cpf.split("").map((item) => Number(item));

    const firstGroupOfNumber = arrayOfCpfNumbers.slice(0, 9);
    const secondGroupOfNumber = arrayOfCpfNumbers.slice(9, 11);

    const firstDigitVerification = this.firstDigitVerification(
      firstGroupOfNumber,
      secondGroupOfNumber
    );

    const secondDigitVerification = this.secondDigitVerification(
      firstGroupOfNumber,
      secondGroupOfNumber
    );

    return firstDigitVerification || secondDigitVerification;
  }

  private firstDigitVerification(
    firstGroupOfNumber: number[],
    secondGroupOfNumber: number[]
  ): boolean {
    const digitsSum = firstGroupOfNumber.reduce(
      (accumulator, currentValue, index) => {
        return accumulator + currentValue * (10 - index);
      },
      0
    );

    return (digitsSum * 10) % 11 !== secondGroupOfNumber[0];
  }

  private secondDigitVerification(
    firstGroupOfNumber: number[],
    secondGroupOfNumber: number[]
  ): boolean {
    const digitsSum =
      firstGroupOfNumber.reduce((accumulator, currentValue, index) => {
        return accumulator + currentValue * (11 - index);
      }, 0) +
      secondGroupOfNumber[0] * 2;

    return (digitsSum * 10) % 11 !== secondGroupOfNumber[1];
  }
}
