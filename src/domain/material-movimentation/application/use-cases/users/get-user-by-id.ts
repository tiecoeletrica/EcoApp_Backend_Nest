import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UserRepository } from "../../repositories/user-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { UserWithBaseContract } from "src/domain/material-movimentation/enterprise/entities/value-objects/user-with-base-contract";

interface GetUserByIdUseCaseRequest {
  userId: string;
}

type GetUserByIdUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    user: UserWithBaseContract;
  }
>;

@Injectable()
export class GetUserByIdUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
  }: GetUserByIdUseCaseRequest): Promise<GetUserByIdUseCaseResponse> {
    const user = await this.userRepository.findByIdWithBaseContract(userId);

    if (!user)
      return left(new ResourceNotFoundError("Id do usuário não encontrado"));

    return right({ user });
  }
}
