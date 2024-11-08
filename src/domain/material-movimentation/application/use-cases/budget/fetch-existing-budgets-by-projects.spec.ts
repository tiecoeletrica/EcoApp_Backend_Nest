import { beforeEach, describe, expect, it } from "vitest";
import { FetchExistingBudgetByProjectsUseCase } from "./fetch-existing-budgets-by-projects";
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
import { makeUser } from "test/factories/make-user";
import { makeMaterial } from "test/factories/make-material";

let inMemoryMaterialRepository: InMemoryMaterialRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBudgetRepository: InMemoryBudgetRepository;
let sut: FetchExistingBudgetByProjectsUseCase;

describe("Get existing budgets by projectIds", () => {
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
    sut = new FetchExistingBudgetByProjectsUseCase(inMemoryBudgetRepository);
  });

  it("should be able to get an array of Budgets by an array of projectIds", async () => {
    // entity creation for details
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const estimator = makeUser({ contractId: contract.id, baseId: base.id });
    await inMemoryUserRepository.create(estimator);

    const material = makeMaterial({ contractId: contract.id });
    await inMemoryMaterialRepository.create(material);

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

    const newBudget1 = makeBudget({
      projectId: project1.id,
      value: 5,
      contractId: contract.id,
      estimatorId: estimator.id,
      materialId: material.id,
    });
    const newBudget2 = makeBudget({
      projectId: project2.id,
      contractId: contract.id,
      estimatorId: estimator.id,
      materialId: material.id,
    });
    const newBudget3 = makeBudget({
      projectId: project2.id,
      contractId: contract.id,
      estimatorId: estimator.id,
      materialId: material.id,
    });
    const newBudget4 = makeBudget({
      projectId: project3.id,
      contractId: contract.id,
      estimatorId: estimator.id,
      materialId: material.id,
    });

    await inMemoryBudgetRepository.create([
      newBudget1,
      newBudget2,
      newBudget3,
      newBudget4,
    ]);

    for await (const result of sut.execute({
      projectIds: [project1.id.toString(), project2.id.toString()],
      contractId: contract.id.toString(),
    })) {
      expect(result.isRight()).toBeTruthy();
      if (result.isRight()) {
        expect(result.value.budgets).toHaveLength(3);
      }
    }
  });

  it("should not be able to get an array of Budgets if there is no budgets of the informed projectIds", async () => {
    // entity creation for details
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const estimator = makeUser({ contractId: contract.id, baseId: base.id });
    await inMemoryUserRepository.create(estimator);

    const material = makeMaterial({ contractId: contract.id });
    await inMemoryMaterialRepository.create(material);

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

    const newBudget1 = makeBudget({
      projectId: project1.id,
      value: 5,
      contractId: contract.id,
      estimatorId: estimator.id,
      materialId: material.id,
    });
    const newBudget2 = makeBudget({
      projectId: project2.id,
      contractId: contract.id,
      estimatorId: estimator.id,
      materialId: material.id,
    });
    const newBudget3 = makeBudget({
      projectId: project2.id,
      contractId: contract.id,
      estimatorId: estimator.id,
      materialId: material.id,
    });
    const newBudget4 = makeBudget({
      projectId: project3.id,
      contractId: contract.id,
      estimatorId: estimator.id,
      materialId: material.id,
    });

    await inMemoryBudgetRepository.create([
      newBudget1,
      newBudget2,
      newBudget3,
      newBudget4,
    ]);

    for await (const result of sut.execute({
      projectIds: ["project-id-1", "project-id-2"],
      contractId: contract.id.toString(),
    })) {
      expect(result.isLeft()).toBeTruthy();
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });
});
