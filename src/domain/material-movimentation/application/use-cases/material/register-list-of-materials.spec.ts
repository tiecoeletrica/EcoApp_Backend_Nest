import { beforeEach, describe, expect, it } from "vitest";
import { RegisterListOfMaterialsUseCase } from "./register-list-of-materials";
import { InMemoryMaterialRepository } from "../../../../../../test/repositories/in-memory-material-repository";
import { ResourceAlreadyRegisteredError } from "../../../../../core/errors/errors/resource-already-registered-error";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeContract } from "test/factories/make-contract";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { makeMaterial } from "test/factories/make-material";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryMaterialRepository: InMemoryMaterialRepository;
let sut: RegisterListOfMaterialsUseCase;

describe("Register list of materials", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    sut = new RegisterListOfMaterialsUseCase(
      inMemoryMaterialRepository,
      inMemoryContractRepository
    );
  });

  it("should be able to register a list of materials", async () => {
    const contract = makeContract({}, new UniqueEntityID("contrato-1"));
    await inMemoryContractRepository.create(contract);

    const result = await sut.execute([
      {
        code: 32142141,
        description: "Material não sei das quantas",
        type: "concreto",
        unit: "CDA",
        contractId: "contrato-1",
      },
      {
        code: 3214214,
        description: "Material não sei das quantas 2",
        type: "ferragem",
        unit: "CDA",
        contractId: "contrato-1",
      },
    ]);

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.materials).toHaveLength(2);
  });

  it("should not be able to register a list of materials that at least one code is already registered", async () => {
    const contract = makeContract({}, new UniqueEntityID("contrato-1"));
    await inMemoryContractRepository.create(contract);

    const material = makeMaterial({ code: 32142141, contractId: contract.id });
    await inMemoryMaterialRepository.create(material);

    const result = await sut.execute([
      {
        code: 32142141,
        description: "Material não sei das quantas",
        type: "concreto",
        unit: "CDA",
        contractId: "contrato-1",
      },
      {
        code: 3214214,
        description: "Material não sei das quantas 2",
        type: "ferragem",
        unit: "CDA",
        contractId: "contrato-1",
      },
    ]);

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceAlreadyRegisteredError);
  });

  it("should not be able to create a material that baseId does not exist", async () => {
    const contract = makeContract({}, new UniqueEntityID("contrato-1"));
    await inMemoryContractRepository.create(contract);

    const result = await sut.execute([
      {
        code: 32142141,
        description: "Material não sei das quantas",
        type: "concreto",
        unit: "CDA",
        contractId: "contrato-1",
      },
      {
        code: 3214214,
        description: "Material não sei das quantas 2",
        type: "ferragem",
        unit: "CDA",
        contractId: "contrato-2-not-registered",
      },
    ]);

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
