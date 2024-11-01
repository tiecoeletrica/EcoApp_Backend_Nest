import { beforeEach, describe, expect, it, test } from "vitest";
import { EditUserUseCase } from "./edit-user";
import { InMemoryUserRepository } from "../../../../../../test/repositories/in-memory-user-repository";
import { makeUser } from "../../../../../../test/factories/make-user";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeBase } from "test/factories/make-base";
import { makeContract } from "test/factories/make-contract";
import { NotAllowedError } from "../errors/not-allowed-error";
import { NotValidError } from "../errors/not-valid-error";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let sut: EditUserUseCase;
let fakeHasher: FakeHasher;

describe("Edit User", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryUserRepository = new InMemoryUserRepository(
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
    fakeHasher = new FakeHasher();
    sut = new EditUserUseCase(
      inMemoryUserRepository,
      fakeHasher,
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
  });

  it("should be able to edit a user", async () => {
    const contract = makeContract({}, new UniqueEntityID("Bahia"));
    await inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("Vitória da Conquista")
    );
    await inMemoryBaseRepository.create(base);

    const user = makeUser();
    const author = makeUser({ type: "Administrador" });

    await inMemoryUserRepository.create(author);
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      authorId: author.id.toString(),
      userId: user.id.toString(),
      baseId: "Vitória da Conquista",
      contractId: "Bahia",
      password: "123456",
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryUserRepository.items[1]).toMatchObject({
      props: {
        baseId: new UniqueEntityID("Vitória da Conquista"),
      },
    });
    expect(
      await fakeHasher.compare(
        "123456",
        inMemoryUserRepository.items[1].password
      )
    ).toBe(true);
  });

  it("should not be able to edit a user if the author is not 'Administrador' 'Almoxarife Líder' or itself", async () => {
    const base = makeBase({}, new UniqueEntityID("Vitória da Conquista"));
    await inMemoryBaseRepository.create(base);

    const user = makeUser();
    const author = makeUser({ type: "Almoxarife" });

    await inMemoryUserRepository.create(author);
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      authorId: author.id.toString(),
      userId: user.id.toString(),
      baseId: "Vitória da Conquista",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(inMemoryUserRepository.items[1].baseId).toEqual(user.baseId);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it("should not be able to edit a user if informed base does not pertence to it's contract", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("Vitória da Conquista")
    );
    await inMemoryBaseRepository.create(base);

    const user = makeUser();
    const author = makeUser({ type: "Administrador" });

    await inMemoryUserRepository.create(author);
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      authorId: author.id.toString(),
      userId: user.id.toString(),
      baseId: "Vitória da Conquista",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotValidError);
  });

  it("should not be able to edit a user if informed base does not pertence to informed contract", async () => {
    const contract = makeContract({}, new UniqueEntityID("Bahia"));
    await inMemoryContractRepository.create(contract);

    const contract2 = makeContract({}, new UniqueEntityID("Pernambuco"));
    await inMemoryContractRepository.create(contract2);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("Vitória da Conquista")
    );
    await inMemoryBaseRepository.create(base);

    const user = makeUser();
    const author = makeUser({ type: "Administrador" });

    await inMemoryUserRepository.create(author);
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      authorId: author.id.toString(),
      userId: user.id.toString(),
      baseId: "Vitória da Conquista",
      contractId: "Pernambuco",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotValidError);
  });

  it("should not be able to edit the password of another user if author is not 'Administrador'", async () => {
    const contract = makeContract({}, new UniqueEntityID("Bahia"));
    await inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("Vitória da Conquista")
    );
    await inMemoryBaseRepository.create(base);

    const user = makeUser();
    const author = makeUser({ type: "Almoxarife Líder" });

    await inMemoryUserRepository.create(author);
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      authorId: author.id.toString(),
      userId: user.id.toString(),
      baseId: "Vitória da Conquista",
      contractId: "Bahia",
      password: "123456",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(inMemoryUserRepository.items[1].baseId).toEqual(user.baseId);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it("should not be able update user type to 'Administrador' if author is not 'Administrador'", async () => {
    const contract = makeContract({}, new UniqueEntityID("Bahia"));
    await inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("Vitória da Conquista")
    );
    await inMemoryBaseRepository.create(base);

    const user = makeUser({ type: "Supervisor" });
    const author = makeUser({ type: "Almoxarife Líder" });

    await inMemoryUserRepository.create(author);
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      authorId: author.id.toString(),
      userId: user.id.toString(),
      type: "Administrador",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(inMemoryUserRepository.items[1].type).toEqual("Supervisor");
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
