import { beforeEach, describe, expect, it } from "vitest";
import { FetchProjectsBudgetsByMaterialsUseCase } from "./fetch-projects-of-budgets-by-meterials";
import { InMemoryProjectRepository } from "../../../../../../test/repositories/in-memory-project-repository";
import { InMemoryBudgetRepository } from "../../../../../../test/repositories/in-memory-budget-repository";
import { makeBudget } from "../../../../../../test/factories/make-budget";
import { makeProject } from "../../../../../../test/factories/make-project";
import { InMemoryMaterialRepository } from "test/repositories/in-memory-material-repository";
import { InMemoryUserRepository } from "test/repositories/in-memory-user-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeContract } from "test/factories/make-contract";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { makeBase } from "test/factories/make-base";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { makeMaterial } from "test/factories/make-material";

let inMemoryMaterialRepository: InMemoryMaterialRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBudgetRepository: InMemoryBudgetRepository;
let sut: FetchProjectsBudgetsByMaterialsUseCase;

describe("Get projects of budgets by material codes", () => {
  beforeEach(() => {
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    inMemoryUserRepository = new InMemoryUserRepository(
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryProjectRepository = new InMemoryProjectRepository(
      inMemoryBaseRepository
    );
    inMemoryBudgetRepository = new InMemoryBudgetRepository(
      inMemoryUserRepository,
      inMemoryMaterialRepository,
      inMemoryProjectRepository,
      inMemoryContractRepository
    );
    sut = new FetchProjectsBudgetsByMaterialsUseCase(
      inMemoryBudgetRepository,
      inMemoryProjectRepository,
      inMemoryMaterialRepository
    );
  });

  it("should be able to get an array of found projects by an array of material_codes", async () => {
    // entity creation for details
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project1 = makeProject({
      project_number: "B-123456",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project1);

    const project2 = makeProject({
      project_number: "B-1234567",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project2);

    const project3 = makeProject({
      project_number: "B-12345678",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project3);

    const material1 = makeMaterial({ code: 123456, contractId: contract.id });
    await inMemoryMaterialRepository.create(material1);

    const material2 = makeMaterial({ code: 654321, contractId: contract.id });
    await inMemoryMaterialRepository.create(material2);

    const material3 = makeMaterial({ code: 111111, contractId: contract.id });
    await inMemoryMaterialRepository.create(material3);

    const newBudget1 = makeBudget({
      projectId: project1.id,
      value: 5,
      contractId: contract.id,
      materialId: material1.id,
    });
    const newBudget2 = makeBudget({
      projectId: project2.id,
      contractId: contract.id,
      materialId: material2.id,
    });
    const newBudget3 = makeBudget({
      projectId: project3.id,
      contractId: contract.id,
      materialId: material3.id,
    });

    await inMemoryBudgetRepository.create([newBudget1, newBudget2, newBudget3]);

    const result = await sut.execute({
      material_codes: [123456, 654321],
      contractId: contract.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.foundProjects).toHaveLength(2);
      expect(result.value.foundProjects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: project1.id.toString(),
            project_number: "B-123456",
          }),
          expect.objectContaining({
            id: project2.id.toString(),
            project_number: "B-1234567",
          }),
        ])
      );
    }
  });

  it("should not be able to get an array of found projects if codes does not exist", async () => {
    // entity creation for details
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project1 = makeProject({
      project_number: "B-123456",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project1);

    const project2 = makeProject({
      project_number: "B-1234567",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project2);

    const project3 = makeProject({
      project_number: "B-12345678",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project3);

    const material1 = makeMaterial({ code: 123456, contractId: contract.id });
    await inMemoryMaterialRepository.create(material1);

    const material2 = makeMaterial({ code: 654321, contractId: contract.id });
    await inMemoryMaterialRepository.create(material2);

    const material3 = makeMaterial({ code: 111111, contractId: contract.id });
    await inMemoryMaterialRepository.create(material3);

    const newBudget1 = makeBudget({
      projectId: project1.id,
      value: 5,
      contractId: contract.id,
      materialId: material1.id,
    });
    const newBudget2 = makeBudget({
      projectId: project2.id,
      contractId: contract.id,
      materialId: material2.id,
    });
    const newBudget3 = makeBudget({
      projectId: project3.id,
      contractId: contract.id,
      materialId: material3.id,
    });

    await inMemoryBudgetRepository.create([newBudget1, newBudget2, newBudget3]);

    const result = await sut.execute({
      material_codes: [222222, 222222],
      contractId: contract.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not be able to get an array of found projects if there is no budgets of informed material_codes", async () => {
    // entity creation for details
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project1 = makeProject({
      project_number: "B-123456",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project1);

    const project2 = makeProject({
      project_number: "B-1234567",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project2);

    const project3 = makeProject({
      project_number: "B-12345678",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project3);

    const material1 = makeMaterial({ code: 123456, contractId: contract.id });
    await inMemoryMaterialRepository.create(material1);

    const material2 = makeMaterial({ code: 654321, contractId: contract.id });
    await inMemoryMaterialRepository.create(material2);

    const material3 = makeMaterial({ code: 111111, contractId: contract.id });
    await inMemoryMaterialRepository.create(material3);

    const result = await sut.execute({
      material_codes: [123456, 654321],
      contractId: contract.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
