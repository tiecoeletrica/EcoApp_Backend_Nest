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
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { EditBudgetUseCase } from "./edit-budget";
import { makeContract } from "test/factories/make-contract";
import { makeBudget } from "test/factories/make-budget";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryMaterialRepository: InMemoryMaterialRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryBudgetRepository: InMemoryBudgetRepository;
let sut: EditBudgetUseCase;

describe("Edit Budget", () => {
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
      inMemoryContractRepository
    );
    sut = new EditBudgetUseCase(
      inMemoryBudgetRepository,
      inMemoryUserRepository,
      inMemoryMaterialRepository,
      inMemoryProjectRepository
    );
  });

  it("should be able to edit a budget", async () => {
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

    const budget = makeBudget({
      contractId: contract.id,
      estimatorId: user.id,
      materialId: material.id,
      projectId: project.id,
      value: 3,
    });
    await inMemoryBudgetRepository.create([budget]);

    const updatedBudgets = [{ budgetId: budget.id.toString(), value: 5 }];
    const newBudgets = [];

    const result = await sut.execute({
      estimatorId: user.id.toString(),
      projectId: project.id.toString(),
      updatedBudgets,
      newBudgets,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.updatedBudgets[0].value).toEqual(5);
    }
    expect(inMemoryBudgetRepository.items).toHaveLength(1);
  });

  it("should be able to edit a budget inserting new items", async () => {
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

    const budget = makeBudget({
      contractId: contract.id,
      estimatorId: user.id,
      materialId: material.id,
      projectId: project.id,
      value: 3,
    });
    await inMemoryBudgetRepository.create([budget]);

    const updatedBudgets = [{ budgetId: budget.id.toString(), value: 5 }];
    const newBudgets = [{ materialId: material.id.toString(), value: 6 }];

    const result = await sut.execute({
      estimatorId: user.id.toString(),
      projectId: project.id.toString(),
      updatedBudgets,
      newBudgets,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.newBudgets[0].value).toEqual(6);
      expect(result.value.updatedBudgets[0].value).toEqual(5);
    }
    expect(inMemoryBudgetRepository.items).toHaveLength(2);
  });

  it("should mpt be able to edit a budget if informed Ids are not found", async () => {
    const result = await sut.execute({
      estimatorId: "estimator-id",
      projectId: "project-id",
      updatedBudgets: [],
      newBudgets: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
