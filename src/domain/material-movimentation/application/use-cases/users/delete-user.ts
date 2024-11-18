import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UserRepository } from "../../repositories/user-repository";
import { NotAllowedError } from "../../../../../core/errors/errors/not-allowed-error";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";

interface DeleteUserUseCaseRequest {
  userId: string;
  authorId: string;
}

type DeleteUserResponse = Eihter<ResourceNotFoundError | NotAllowedError, null>;

@Injectable()
export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
    authorId,
  }: DeleteUserUseCaseRequest): Promise<DeleteUserResponse> {
    const users = await this.userRepository.findByIds([authorId, userId]);
    const user = users.find((item) => item.id.toString() === userId);
    const author = users.find((item) => item.id.toString() === authorId);

    if (!author)
      return left(new ResourceNotFoundError("Id do autor não encontrado"));
    if (!user)
      return left(new ResourceNotFoundError("Id do usuário não encontrado"));

    if (author.type != "Administrador") return left(new NotAllowedError());

    await this.userRepository.delete(userId);

    return right(null);
  }
}
