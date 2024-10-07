import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUserRepository } from "../../../../../../test/repositories/in-memory-user-repository";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { FakeEncrypter } from "test/cryptography/fake-encrypter";
import { AuthenticateUserUseCase } from "./authenticate-user";
import { WrogCredentialsError } from "../errors/wrong-credentials";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { makeUser } from "test/factories/make-user";

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let fakeHasher: FakeHasher;
let fakeEncrypter: FakeEncrypter;
let sut: AuthenticateUserUseCase;

describe("authenticate storekeeper", () => {
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
    fakeEncrypter = new FakeEncrypter();
    sut = new AuthenticateUserUseCase(
      inMemoryUserRepository,
      fakeHasher,
      fakeEncrypter
    );
  });

  it("should be able to authenticate a storekeeper", async () => {
    const user = makeUser({
      email: "rodrigo@ecoeletrica.com",
      password: await fakeHasher.hash("123456"),
      type: "Almoxarife",
    });

    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      email: "rodrigo@ecoeletrica.com",
      password: "123456",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    });
  });

  it("should be able to authenticate a estimator", async () => {
    const user = makeUser({
      email: "rodrigo@ecoeletrica.com",
      password: await fakeHasher.hash("123456"),
      type: "Orçamentista",
    });

    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      email: "rodrigo@ecoeletrica.com",
      password: "123456",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    });
  });

  it("should not be able to authenticate a storekeeper with wrong password", async () => {
    const user = makeUser({
      email: "rodrigo@ecoeletrica.com",
      password: await fakeHasher.hash("123456"),
    });

    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      email: "rodrigo@ecoeletrica.com",
      password: "12345",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrogCredentialsError);
  });
});
