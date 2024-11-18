import { beforeEach, describe, expect, it } from "vitest";
import { RegisterContractUseCase } from "./register-contract";
import { InMemoryContractRepository } from "../../../../../../test/repositories/in-memory-contract-repository";
import { ResourceAlreadyRegisteredError } from "../../../../../core/errors/errors/resource-already-registered-error";

let inMemoryContractRepository: InMemoryContractRepository;
let sut: RegisterContractUseCase;

describe("Register Contract", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    sut = new RegisterContractUseCase(inMemoryContractRepository);
  });

  it("should be able to register a contract", async () => {
    const result = await sut.execute({
      contractName: "Celpe",
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryContractRepository.items[0].contractName).toEqual("Celpe");
  });

  it("should not be able to register a contract if contractName is already registered", async () => {
    await sut.execute({
      contractName: "Celpe",
    });

    const result = await sut.execute({
      contractName: "Celpe",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceAlreadyRegisteredError);
  });
});
