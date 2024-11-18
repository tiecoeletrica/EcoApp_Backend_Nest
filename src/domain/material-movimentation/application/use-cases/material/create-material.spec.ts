import { beforeEach, describe, expect, it } from "vitest";
import { CreateMaterialUseCase } from "./create-material";
import { InMemoryMaterialRepository } from "../../../../../../test/repositories/in-memory-material-repository";
import { ResourceAlreadyRegisteredError } from "../../../../../core/errors/errors/resource-already-registered-error";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeContract } from "test/factories/make-contract";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { makeMaterial } from "test/factories/make-material";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryMaterialRepository: InMemoryMaterialRepository;
let sut: CreateMaterialUseCase;

describe("Create Material", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    sut = new CreateMaterialUseCase(
      inMemoryMaterialRepository,
      inMemoryContractRepository
    );
  });

  it("should be able to create a material", async () => {
    const contract = makeContract({}, new UniqueEntityID("contrato-1"));
    await inMemoryContractRepository.create(contract);

    const result = await sut.execute({
      code: 32142141,
      description: "Material não sei das quantas",
      type: "concreto",
      unit: "CDA",
      contractId: "contrato-1",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.material.code).toEqual(32142141);
      expect(result.value.material.type).toEqual("concreto");
    }
    expect(inMemoryMaterialRepository.items[0].id).toBeTruthy();
  });

  it("should not be able to create a material that code is already registered", async () => {
    const contract = makeContract({}, new UniqueEntityID("contrato-1"));
    await inMemoryContractRepository.create(contract);

    const material = makeMaterial({ code: 32142141, contractId: contract.id });
    await inMemoryMaterialRepository.create(material);

    const result = await sut.execute({
      code: 32142141,
      description: "Material não sei das quantas",
      type: "concreto",
      unit: "CDA",
      contractId: "contrato-1",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceAlreadyRegisteredError);
  });

  it("should not be able to create a material that baseId does not exist", async () => {
    const result = await sut.execute({
      code: 32142141,
      description: "Material não sei das quantas",
      type: "concreto",
      unit: "CDA",
      contractId: "contrato-1",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
