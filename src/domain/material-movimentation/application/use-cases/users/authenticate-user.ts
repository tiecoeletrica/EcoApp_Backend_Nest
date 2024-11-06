import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { Encrypter } from "../../cryptography/encrypter";
import { HashComparer } from "../../cryptography/hash-comperer";
import { WrogCredentialsError } from "../errors/wrong-credentials";
import { UserRepository } from "../../repositories/user-repository";

interface AuthenticateUserUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateUserResponse = Eihter<
  WrogCredentialsError,
  {
    accessToken: string;
  }
>;

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashComprarer: HashComparer,
    private encrypter: Encrypter
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || user.status === "inativo")
      return left(new WrogCredentialsError());

    const isPasswordValid = await this.hashComprarer.compare(
      password,
      user.password
    );

    if (!isPasswordValid) return left(new WrogCredentialsError());

    const accessToken = await this.encrypter.encrypter({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
      firstLogin: user.firstLogin,
      cpf: user.cpf,
      name: user.name,
      email: user.email,
    });

    return right({ accessToken });
  }
}
