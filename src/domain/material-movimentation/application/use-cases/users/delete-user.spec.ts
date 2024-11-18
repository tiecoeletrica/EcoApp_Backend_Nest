import { beforeEach, describe, expect, it } from "vitest";
import { DeleteUserUseCase } from "./delete-user";
import { InMemoryUserRepository } from "../../../../../../test/repositories/in-memory-user-repository";
import { makeUser } from "../../../../../../test/factories/make-user";
import { NotAllowedError } from "../../../../../core/errors/errors/not-allowed-error";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let sut: DeleteUserUseCase;

describe("Delete User", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryUserRepository = new InMemoryUserRepository(
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
    sut = new DeleteUserUseCase(inMemoryUserRepository);
  });

  it("should be able to delete a user", async () => {
    const user = makeUser();
    const author = makeUser({ type: "Administrador" });

    await inMemoryUserRepository.create(author);
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      authorId: author.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryUserRepository.items).toHaveLength(1); // there'll be only the author
  });

  it("should not be able to delete a user if the author is not 'Administrador'", async () => {
    const user = makeUser();
    const author = makeUser({ type: "Almoxarife" });

    await inMemoryUserRepository.create(author);
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      authorId: author.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotAllowedError);
    expect(inMemoryUserRepository.items).toHaveLength(2);
  });
});
