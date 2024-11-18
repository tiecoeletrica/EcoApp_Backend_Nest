import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUserRepository } from "test/repositories/in-memory-user-repository";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeBase } from "test/factories/make-base";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { WrongTypeError } from "../../../../../core/errors/errors/wrong-type";
import { RegisterUserUseCase } from "./register-user";
import { makeContract } from "test/factories/make-contract";
import { NotValidError } from "../../../../../core/errors/errors/not-valid-error";
import { NotAllowedError } from "../../../../../core/errors/errors/not-allowed-error";

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let fakeHasher: FakeHasher;
let sut: RegisterUserUseCase;

describe("Create user", () => {
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
    sut = new RegisterUserUseCase(
      inMemoryUserRepository,
      fakeHasher,
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
  });

  it("should be able to register a storekeeper", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const result = await sut.execute({
      authorType: "Administrador",
      name: "Rodrigo",
      email: "rodrigo@ecoeletrica.com.br",
      cpf: "92587813840",
      type: "Almoxarife",
      baseId: base.id.toString(),
      contractId: contract.id.toString(),
      password: "123456",
    });

    const hashedPassword = await fakeHasher.hash("123456");

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.user.status).toBeTruthy();
      expect(result.value.user.password).toEqual(hashedPassword);
      expect(result.value.user.firstLogin).toBeTruthy();
    }
    expect(inMemoryUserRepository.items[0].id).toBeTruthy();
  });

  it("should be able to register a estimator", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const result = await sut.execute({
      authorType: "Administrador",
      name: "Rodrigo",
      email: "rodrigo@ecoeletrica.com.br",
      cpf: "42133377581",
      type: "Orçamentista",
      baseId: base.id.toString(),
      contractId: contract.id.toString(),
      password: "123456",
    });

    const hashedPassword = await fakeHasher.hash("123456");

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.user.status).toBeTruthy();
      expect(result.value.user.password).toEqual(hashedPassword);
    }
    expect(inMemoryUserRepository.items[0].id).toBeTruthy();
  });

  it("should not be able to register a user if baseId does not exist", async () => {
    const result = await sut.execute({
      authorType: "Administrador",
      name: "Rodrigo",
      email: "rodrigo@ecoeletrica.com.br",
      cpf: "51094627046",
      type: "administrador",
      baseId: "base-1",
      contractId: "contract-1",
      password: "123456",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not be able to register a user if type is not valid", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const result = await sut.execute({
      authorType: "Administrador",
      name: "Rodrigo",
      email: "rodrigo@ecoeletrica.com.br",
      cpf: "52998224725",
      type: "Assistente",
      baseId: base.id.toString(),
      contractId: contract.id.toString(),
      password: "123456",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(WrongTypeError);
  });

  it("should not be able to register a user if contractId is not equal to contractId of informed base", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase();
    await inMemoryBaseRepository.create(base);

    const result = await sut.execute({
      authorType: "Administrador",
      name: "Rodrigo",
      email: "rodrigo@ecoeletrica.com.br",
      cpf: "52998224725",
      type: "Almoxarife",
      baseId: base.id.toString(),
      contractId: contract.id.toString(),
      password: "123456",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotValidError);
  });

  it("should not be able to register a user the author is not 'Almoxarife Líder' or 'Administrador'", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const result = await sut.execute({
      authorType: "Almoxarife",
      name: "Rodrigo",
      email: "rodrigo@ecoeletrica.com.br",
      cpf: "52998224725",
      type: "Almoxarife",
      baseId: base.id.toString(),
      contractId: contract.id.toString(),
      password: "123456",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it("should not be able to register a user with type 'Administrador' if the author is not 'Administrador'", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const result = await sut.execute({
      authorType: "Almoxarife Líder",
      name: "Rodrigo",
      email: "rodrigo@ecoeletrica.com.br",
      cpf: "52998224725",
      type: "Administrador",
      baseId: base.id.toString(),
      contractId: contract.id.toString(),
      password: "123456",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it("should not be able to register a user with a invalid CPF", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const result = await sut.execute({
      authorType: "Administrador",
      name: "Rodrigo",
      email: "rodrigo@ecoeletrica.com.br",
      cpf: "52998224722",
      type: "Administrador",
      baseId: base.id.toString(),
      contractId: contract.id.toString(),
      password: "123456",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotValidError);
  });
});
