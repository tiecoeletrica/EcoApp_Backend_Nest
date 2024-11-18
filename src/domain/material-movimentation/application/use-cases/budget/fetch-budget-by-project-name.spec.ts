import { beforeEach, describe, expect, it } from "vitest";
import { FetchBudgetByProjectNameUseCase } from "./fetch-budget-by-project-name";
import { InMemoryProjectRepository } from "../../../../../../test/repositories/in-memory-project-repository";
import { InMemoryBudgetRepository } from "../../../../../../test/repositories/in-memory-budget-repository";
import { makeBudget } from "../../../../../../test/factories/make-budget";
import { makeProject } from "../../../../../../test/factories/make-project";
import { InMemoryMaterialRepository } from "test/repositories/in-memory-material-repository";
import { InMemoryUserRepository } from "test/repositories/in-memory-user-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeContract } from "test/factories/make-contract";
import { makeUser } from "test/factories/make-user";
import { makeMaterial } from "test/factories/make-material";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { makeBase } from "test/factories/make-base";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";

let inMemoryMaterialRepository: InMemoryMaterialRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBudgetRepository: InMemoryBudgetRepository;
let sut: FetchBudgetByProjectNameUseCase;

describe("Get Budget by project", () => {
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
    sut = new FetchBudgetByProjectNameUseCase(
      inMemoryBudgetRepository,
      inMemoryProjectRepository
    );
  });

  it("should be able to get an array of budgets by project", async () => {
    // entity creation for details
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const estimator = makeUser({ contractId: contract.id, baseId: base.id });
    await inMemoryUserRepository.create(estimator);

    const material = makeMaterial({ contractId: contract.id });
    await inMemoryMaterialRepository.create(material);

    const project = makeProject({
      project_number: "B-10101010",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project);

    const newBudget1 = makeBudget({
      projectId: project.id,
      value: 5,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });
    const newBudget2 = makeBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });
    const newBudget3 = makeBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });

    await inMemoryBudgetRepository.create([newBudget1, newBudget2, newBudget3]);

    const result = await sut.execute({
      project_number: "B-10101010",
      contractId: contract.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.budgets[0].value).toEqual(5);
    expect(inMemoryProjectRepository.items[0].id).toBeTruthy();
    expect(inMemoryBudgetRepository.items[2].id).toBeTruthy();
  });

  it("should not be able to get an array of budgets if project is not found", async () => {
    // entity creation for details
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const estimator = makeUser({ contractId: contract.id });
    await inMemoryUserRepository.create(estimator);

    const material = makeMaterial();
    await inMemoryMaterialRepository.create(material);

    const project = makeProject({
      project_number: "B-10101010",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project);

    const newBudget1 = makeBudget({
      projectId: project.id,
      value: 5,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });
    const newBudget2 = makeBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });
    const newBudget3 = makeBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });

    await inMemoryBudgetRepository.create([newBudget1, newBudget2, newBudget3]);

    const result = await sut.execute({
      project_number: "B-dntExists",
      contractId: contract.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not be able to get an array of budgets if project has not a budget list", async () => {
    // entity creation for details
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const estimator = makeUser({ contractId: contract.id });
    await inMemoryUserRepository.create(estimator);

    const material = makeMaterial();
    await inMemoryMaterialRepository.create(material);

    const project = makeProject({
      project_number: "B-10101010",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project);

    const projectTest = makeProject({
      project_number: "B-to-be-search",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(projectTest);

    const newBudget1 = makeBudget({
      projectId: project.id,
      value: 5,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });
    const newBudget2 = makeBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });
    const newBudget3 = makeBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });

    await inMemoryBudgetRepository.create([newBudget1, newBudget2, newBudget3]);

    const result = await sut.execute({
      project_number: "B-to-be-search",
      contractId: contract.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should be able to get an array of budgets by project and the projectId if requested", async () => {
    // entity creation for details
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const estimator = makeUser({ contractId: contract.id, baseId: base.id });
    await inMemoryUserRepository.create(estimator);

    const material = makeMaterial({ contractId: contract.id });
    await inMemoryMaterialRepository.create(material);

    const project = makeProject({
      project_number: "B-10101010",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project);

    const newBudget1 = makeBudget({
      projectId: project.id,
      value: 5,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });
    const newBudget2 = makeBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });
    const newBudget3 = makeBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });

    await inMemoryBudgetRepository.create([newBudget1, newBudget2, newBudget3]);

    const result = await sut.execute({
      project_number: "B-10101010",
      contractId: contract.id.toString(),
      sendProjectId: true,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.projectId).toEqual(project.id.toString());
  });

  it("should be able to get an array of budgets where zero budgets are at the end of the array", async () => {
    // entity creation for details
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const estimator = makeUser({ contractId: contract.id, baseId: base.id });
    await inMemoryUserRepository.create(estimator);

    const material = makeMaterial({ contractId: contract.id });
    await inMemoryMaterialRepository.create(material);

    const project = makeProject({
      project_number: "B-10101010",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project);

    const newBudget1 = makeBudget({
      projectId: project.id,
      value: 5,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });
    const newBudget2 = makeBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
      value: 0,
    });
    const newBudget3 = makeBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
      value: 3,
    });

    await inMemoryBudgetRepository.create([newBudget1, newBudget2, newBudget3]);

    const result = await sut.execute({
      project_number: "B-10101010",
      contractId: contract.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.budgets).toEqual([
        expect.objectContaining({
          value: 5,
        }),
        expect.objectContaining({
          value: 3,
        }),
        expect.objectContaining({
          value: 0,
        }),
      ]);
    }
  });
});
