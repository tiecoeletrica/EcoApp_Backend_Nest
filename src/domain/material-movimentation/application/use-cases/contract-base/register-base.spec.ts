import { beforeEach, describe, expect, it } from "vitest";
import { RegisterBaseUseCase } from "./register-base";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { ResourceAlreadyRegisteredError } from "../errors/resource-already-registered-error";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeContract } from "test/factories/make-contract";
import { makeBase } from "test/factories/make-base";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let sut: RegisterBaseUseCase;

describe("Create Base", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    sut = new RegisterBaseUseCase(
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
  });

  it("should be able to create a base", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const result = await sut.execute({
      baseName: "Vitória da Conquista",
      contractId: contract.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryBaseRepository.items[0].baseName).toEqual(
      "Vitória da Conquista"
    );
    expect(inMemoryBaseRepository.items[0].contractId).toBeInstanceOf(
      UniqueEntityID
    );
  });

  it("should not be able to register a base if baseName is already registered", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const registerBase = makeBase({ baseName: "Vitória da Conquista" });
    await inMemoryBaseRepository.create(registerBase);

    const result = await sut.execute({
      baseName: "Vitória da Conquista",
      contractId: contract.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceAlreadyRegisteredError);
  });

  it("should not be able to register a base if contract is not found", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const registerBase = makeBase();
    await inMemoryBaseRepository.create(registerBase);

    const result = await sut.execute({
      baseName: "Vitória da Conquista",
      contractId: "contract-2",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
