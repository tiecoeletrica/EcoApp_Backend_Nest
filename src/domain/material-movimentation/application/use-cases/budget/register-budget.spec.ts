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
      inMemoryContractRepository
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

  it("should be able to register a list of budgets and register on Project the modification date", async () => {
    const startDate = new Date();

    // sleep for startDate to be different from createdAt
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    await sleep(100);

    const contract = makeContract({}, new UniqueEntityID("ID-CONTRACT-BA"));
    await inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("ID-BASE-VCA")
    );
    await inMemoryBaseRepository.create(base);

    const project = makeProject(
      { baseId: base.id, firstBudgetRegister: startDate },
      new UniqueEntityID("1")
    );
    await inMemoryProjectRepository.create(project);

    const project2 = makeProject({ baseId: base.id }, new UniqueEntityID("2"));
    await inMemoryProjectRepository.create(project2);

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
      {
        projectId: "2",
        materialId: "4",
        estimatorId: "5",
        contractId: "ID-CONTRACT-BA",
        value: 5,
      },
    ]);

    console.log(
      inMemoryProjectRepository.items[0].lastBudgetRegister!,
      inMemoryBudgetRepository.items[0].createdAt
    );
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(
        areDatesEqualIgnoringMilliseconds(
          inMemoryProjectRepository.items[0].firstBudgetRegister!,
          startDate
        )
      ).toBeTruthy();
      expect(
        areDatesEqualIgnoringMilliseconds(
          inMemoryProjectRepository.items[0].lastBudgetRegister!,
          inMemoryBudgetRepository.items[0].createdAt
        )
      ).toBeTruthy();
      expect(
        areDatesEqualIgnoringMilliseconds(
          inMemoryProjectRepository.items[1].firstBudgetRegister!,
          inMemoryBudgetRepository.items[1].createdAt
        )
      ).toBeTruthy();
      expect(
        areDatesEqualIgnoringMilliseconds(
          inMemoryProjectRepository.items[1].lastBudgetRegister!,
          inMemoryBudgetRepository.items[1].createdAt
        )
      ).toBeTruthy();
    }
  });
});

function areDatesEqualIgnoringMilliseconds(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate() &&
    date1.getUTCHours() === date2.getUTCHours() &&
    date1.getUTCMinutes() === date2.getUTCMinutes() &&
    date1.getUTCSeconds() === date2.getUTCSeconds()
  );
}
