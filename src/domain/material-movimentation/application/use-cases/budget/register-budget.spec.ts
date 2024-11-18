import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryBudgetRepository } from "../../../../../../test/repositories/in-memory-budget-repository";
import { InMemoryUserRepository } from "test/repositories/in-memory-user-repository";
import { InMemoryMaterialRepository } from "test/repositories/in-memory-material-repository";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeProject } from "test/factories/make-project";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { makeUser } from "test/factories/make-user";
import { makeMaterial } from "test/factories/make-material";
import { makeBase } from "test/factories/make-base";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { RegisterBudgetUseCase } from "./register-budget";
import { makeContract } from "test/factories/make-contract";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryMaterialRepository: InMemoryMaterialRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryBudgetRepository: InMemoryBudgetRepository;
let sut: RegisterBudgetUseCase;

describe("Register Budget", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryProjectRepository = new InMemoryProjectRepository(
      inMemoryBaseRepository
    );
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    inMemoryUserRepository = new InMemoryUserRepository(
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
    inMemoryBudgetRepository = new InMemoryBudgetRepository(
      inMemoryUserRepository,
      inMemoryMaterialRepository,
      inMemoryProjectRepository,
      inMemoryContractRepository,
    );
    sut = new RegisterBudgetUseCase(
      inMemoryBudgetRepository,
      inMemoryUserRepository,
      inMemoryMaterialRepository,
      inMemoryProjectRepository,
      inMemoryContractRepository
    );
  });

  it("should be able to register a list of budgets", async () => {
    const contract = makeContract({}, new UniqueEntityID("ID-CONTRACT-BA"));
    await inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("ID-BASE-VCA")
    );
    await inMemoryBaseRepository.create(base);

    const project = makeProject({ baseId: base.id }, new UniqueEntityID("1"));
    await inMemoryProjectRepository.create(project);

    const material = makeMaterial(
      { contractId: contract.id },
      new UniqueEntityID("4")
    );
    await inMemoryMaterialRepository.create(material);

    const user = makeUser({ contractId: contract.id }, new UniqueEntityID("5"));
    await inMemoryUserRepository.create(user);

    const result = await sut.execute([
      {
        projectId: "1",
        materialId: "4",
        estimatorId: "5",
        contractId: "ID-CONTRACT-BA",
        value: 5,
      },
    ]);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.budgets[0].value).toEqual(5);
      expect(result.value.budgets[0].estimatorId.toString()).toEqual("5");
    }
    expect(inMemoryBudgetRepository.items[0].id).toBeTruthy();
  });

  it("should not be able to register budgets if informed Ids are not found", async () => {
    const result = await sut.execute([
      {
        projectId: "1",
        materialId: "4",
        estimatorId: "5",
        contractId: "ID-CONTRACT-BA",
        value: 5,
      },
    ]);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
