import { beforeEach, describe, expect, it } from "vitest";
import { FetchOnlyProjectsOfBudgetsUseCase } from "./fetch-only-projects-of-budgets";
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
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";

let inMemoryMaterialRepository: InMemoryMaterialRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBudgetRepository: InMemoryBudgetRepository;
let sut: FetchOnlyProjectsOfBudgetsUseCase;

describe("Get only projects of exsiting budgets by project", () => {
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
      inMemoryContractRepository,
    );
    sut = new FetchOnlyProjectsOfBudgetsUseCase(
      inMemoryBudgetRepository,
      inMemoryProjectRepository
    );
  });

  it("should be able to get an array of found projects by an array of project_number", async () => {
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

    const newBudget1 = makeBudget({
      projectId: project1.id,
      value: 5,
      contractId: contract.id,
    });
    const newBudget2 = makeBudget({
      projectId: project2.id,
      contractId: contract.id,
    });
    const newBudget3 = makeBudget({
      projectId: project3.id,
      contractId: contract.id,
    });

    await inMemoryBudgetRepository.create([newBudget1, newBudget2, newBudget3]);

    const result = await sut.execute({
      project_numbers: ["B-123456", "B-1234567"],
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

  it("should not be able to get an array of found projects if projects does not exist", async () => {
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

    const newBudget1 = makeBudget({
      projectId: project1.id,
      value: 5,
      contractId: contract.id,
    });
    const newBudget2 = makeBudget({
      projectId: project2.id,
      contractId: contract.id,
    });
    const newBudget3 = makeBudget({
      projectId: project3.id,
      contractId: contract.id,
    });

    await inMemoryBudgetRepository.create([newBudget1, newBudget2, newBudget3]);

    const result = await sut.execute({
      project_numbers: ["B-00000", "B-00001"],
      contractId: contract.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not be able to get an array of found projects if there is not budgets of informed projects", async () => {
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

    const result = await sut.execute({
      project_numbers: ["B-123456", "B-1234567"],
      contractId: contract.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
