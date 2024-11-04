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
import { EditBudgetsByMaterialUseCase } from "./edit-budgets-by-material";
import { makeContract } from "test/factories/make-contract";
import { makeBudget } from "test/factories/make-budget";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryMaterialRepository: InMemoryMaterialRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryBudgetRepository: InMemoryBudgetRepository;
let sut: EditBudgetsByMaterialUseCase;

describe("Edit Budgets by material", () => {
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
    sut = new EditBudgetsByMaterialUseCase(
      inMemoryBudgetRepository,
      inMemoryUserRepository,
      inMemoryMaterialRepository,
      inMemoryProjectRepository
    );
  });

  it("should be able to edit a list of budgets by material", async () => {
    const contract = makeContract({});
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project1 = makeProject({ project_number: "B-test", baseId: base.id });
    await inMemoryProjectRepository.create(project1);

    const project2 = makeProject({ baseId: base.id });
    await inMemoryProjectRepository.create(project2);

    const project3 = makeProject({ project_number: "Btest2", baseId: base.id });
    await inMemoryProjectRepository.create(project3);

    const material1 = makeMaterial({ contractId: contract.id, code: 123456 });
    await inMemoryMaterialRepository.create(material1);

    const material2 = makeMaterial({ contractId: contract.id, code: 654321 });
    await inMemoryMaterialRepository.create(material2);

    const user = makeUser({ contractId: contract.id, type: "Orçamentista" });
    await inMemoryUserRepository.create(user);

    const budgets = [
      makeBudget({
        contractId: contract.id,
        estimatorId: user.id,
        materialId: material1.id,
        projectId: project1.id,
        value: 5,
      }),
      makeBudget({
        contractId: contract.id,
        estimatorId: user.id,
        materialId: material1.id,
        projectId: project2.id,
        value: 2,
      }),
      makeBudget({
        contractId: contract.id,
        estimatorId: user.id,
        materialId: material2.id,
        projectId: project2.id,
        value: 3,
      }),
      makeBudget({
        contractId: contract.id,
        estimatorId: user.id,
        materialId: material1.id,
        projectId: project3.id,
        value: 5,
      }),
      makeBudget({
        contractId: contract.id,
        estimatorId: user.id,
        materialId: material1.id,
        projectId: project3.id,
        value: 3,
      }),
      makeBudget({
        contractId: contract.id,
        estimatorId: user.id,
        materialId: material2.id,
        projectId: project3.id,
        value: 5,
      }),
    ];
    await inMemoryBudgetRepository.create(budgets);

    const result = await sut.execute({
      estimatorId: user.id.toString(),
      project_numbers: ["B-test", "Btest2"],
      codeFrom: 123456,
      codeTo: 654321,
      contractId: contract.id.toString(),
      multiplier: 2,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.budgets).toHaveLength(6);
      expect(result.value.projects).toHaveLength(2);
      expect(result.value.budgets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            projectId: project1.id,
            materialId: material1.id,
            value: 0,
          }),
          expect.objectContaining({
            projectId: project1.id,
            materialId: material2.id,
            value: 10,
          }),
          expect.objectContaining({
            projectId: project3.id,
            materialId: material1.id,
            value: 0,
          }),
          expect.objectContaining({
            projectId: project3.id,
            materialId: material2.id,
            value: 10,
          }),
          expect.objectContaining({
            projectId: project3.id,
            materialId: material1.id,
            value: 0,
          }),
          expect.objectContaining({
            projectId: project3.id,
            materialId: material2.id,
            value: 6,
          }),
        ])
      );
    }
    expect(inMemoryBudgetRepository.items).toHaveLength(9);
    expect(inMemoryBudgetRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          projectId: project1.id,
          materialId: material1.id,
          value: 0,
        }),
        expect.objectContaining({
          projectId: project1.id,
          materialId: material2.id,
          value: 10,
        }),
        expect.objectContaining({
          projectId: project3.id,
          materialId: material1.id,
          value: 0,
        }),
        expect.objectContaining({
          projectId: project3.id,
          materialId: material2.id,
          value: 10,
        }),
        expect.objectContaining({
          projectId: project3.id,
          materialId: material1.id,
          value: 0,
        }),
        expect.objectContaining({
          projectId: project3.id,
          materialId: material2.id,
          value: 6,
        }),
      ])
    );
  });

  it("should not be able to edit a list of budgets if a material code is not found", async () => {
    const contract = makeContract({});
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project1 = makeProject({ project_number: "B-test", baseId: base.id });
    await inMemoryProjectRepository.create(project1);

    const project2 = makeProject({ baseId: base.id });
    await inMemoryProjectRepository.create(project2);

    const material1 = makeMaterial({ contractId: contract.id, code: 123456 });
    await inMemoryMaterialRepository.create(material1);

    const material2 = makeMaterial({ contractId: contract.id, code: 654321 });
    await inMemoryMaterialRepository.create(material2);

    const user = makeUser({ contractId: contract.id, type: "Orçamentista" });
    await inMemoryUserRepository.create(user);

    const budgets = [
      makeBudget({
        contractId: contract.id,
        estimatorId: user.id,
        materialId: material1.id,
        projectId: project1.id,
        value: 5,
      }),
      makeBudget({
        contractId: contract.id,
        estimatorId: user.id,
        materialId: material1.id,
        projectId: project2.id,
        value: 2,
      }),
      makeBudget({
        contractId: contract.id,
        estimatorId: user.id,
        materialId: material2.id,
        projectId: project2.id,
        value: 3,
      }),
    ];
    await inMemoryBudgetRepository.create(budgets);

    const result = await sut.execute({
      estimatorId: user.id.toString(),
      project_numbers: ["B-test"],
      codeFrom: 123456,
      codeTo: 111111,
      contractId: contract.id.toString(),
      multiplier: 2,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    expect(inMemoryBudgetRepository.items).toHaveLength(3);
  });
});
