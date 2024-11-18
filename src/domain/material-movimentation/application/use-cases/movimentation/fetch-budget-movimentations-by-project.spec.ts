import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryMovimentationRepository } from "../../../../../../test/repositories/in-memory-movimentation-repository";
import { makeMovimentation } from "../../../../../../test/factories/make-movimentation";
import { makeBudget } from "../../../../../../test/factories/make-budget";
import { InMemoryProjectRepository } from "../../../../../../test/repositories/in-memory-project-repository";
import { InMemoryBudgetRepository } from "../../../../../../test/repositories/in-memory-budget-repository";
import { FetchBudgetMovimentationByProjectUseCase } from "./fetch-budget-movimentations-by-project";
import { makeProject } from "../../../../../../test/factories/make-project";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryMaterialRepository } from "test/repositories/in-memory-material-repository";
import { InMemoryUserRepository } from "test/repositories/in-memory-user-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeContract } from "test/factories/make-contract";
import { makeBase } from "test/factories/make-base";
import { makeUser } from "test/factories/make-user";
import { makeMaterial } from "test/factories/make-material";

let inMemoryMovimentationRepository: InMemoryMovimentationRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryBudgetRepository: InMemoryBudgetRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryMaterialRepository: InMemoryMaterialRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryContractRepository: InMemoryContractRepository;
let sut: FetchBudgetMovimentationByProjectUseCase;

describe("Fetch budgets and Movimentations by project", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    inMemoryUserRepository = new InMemoryUserRepository(
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
    inMemoryProjectRepository = new InMemoryProjectRepository(
      inMemoryBaseRepository
    );
    inMemoryMovimentationRepository = new InMemoryMovimentationRepository(
      inMemoryUserRepository,
      inMemoryMaterialRepository,
      inMemoryProjectRepository,
      inMemoryBaseRepository
    );
    inMemoryBudgetRepository = new InMemoryBudgetRepository(
      inMemoryUserRepository,
      inMemoryMaterialRepository,
      inMemoryProjectRepository,
      inMemoryContractRepository
    );
    sut = new FetchBudgetMovimentationByProjectUseCase(
      inMemoryMovimentationRepository,
      inMemoryProjectRepository,
      inMemoryBudgetRepository,
      inMemoryBaseRepository
    );
  });

  it("should be able to fetch budgets and movimentations by project sorted by material code", async () => {
    // entity creation for details
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const storekeeper = makeUser({ baseId: base.id });
    await inMemoryUserRepository.create(storekeeper);

    const estimator = makeUser({ contractId: contract.id });
    await inMemoryUserRepository.create(estimator);

    const material1 = makeMaterial({ code: 1, contractId: contract.id });
    await inMemoryMaterialRepository.create(material1);
    const material2 = makeMaterial({ code: 2, contractId: contract.id });
    await inMemoryMaterialRepository.create(material2);
    const material3 = makeMaterial({ code: 3, contractId: contract.id });
    await inMemoryMaterialRepository.create(material3);

    const newProject = makeProject({
      project_number: "Obra-teste",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(newProject);

    const newProject2 = makeProject({
      project_number: "Obra-teste2",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(newProject2);

    const newMovimentation1 = makeMovimentation({
      projectId: newProject.id,
      baseId: base.id,
      materialId: material1.id,
      storekeeperId: storekeeper.id,
    });
    const newMovimentation2 = makeMovimentation({
      projectId: newProject.id,
      baseId: base.id,
      materialId: material2.id,
      storekeeperId: storekeeper.id,
    });
    const newMovimentation3 = makeMovimentation({
      projectId: newProject2.id,
      baseId: base.id,
      materialId: material3.id,
      storekeeperId: storekeeper.id,
    });

    await inMemoryMovimentationRepository.create([
      newMovimentation1,
      newMovimentation2,
      newMovimentation3,
    ]);

    const newBudget1 = makeBudget({
      projectId: newProject.id,
      contractId: contract.id,
      materialId: material1.id,
      estimatorId: estimator.id,
    });
    const newBudget2 = makeBudget({
      projectId: newProject.id,
      contractId: contract.id,
      materialId: material3.id,
      estimatorId: estimator.id,
    });
    const newBudget3 = makeBudget({
      projectId: newProject2.id,
      contractId: contract.id,
      materialId: material2.id,
      estimatorId: estimator.id,
    });

    await inMemoryBudgetRepository.create([newBudget1, newBudget2, newBudget3]);

    const result = await sut.execute({
      project_number: "Obra-teste",
      baseId: base.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.movimentations).toHaveLength(2);
      expect(result.value.movimentations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            material: expect.objectContaining({ code: 1 }),
          }),
          expect.objectContaining({
            material: expect.objectContaining({ code: 2 }),
          }),
        ])
      );

      expect(result.value.budgets).toHaveLength(2);
      expect(result.value.budgets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            material: expect.objectContaining({ code: 1 }),
          }),
          expect.objectContaining({
            material: expect.objectContaining({ code: 3 }),
          }),
        ])
      );
    }
  });

  it("should not be able to fetch budgets and movimentations if the project was not found", async () => {
    // entity creation for details
    const contract = makeContract();
    inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    inMemoryBaseRepository.create(base);

    const storekeeper = makeUser({ baseId: base.id });
    inMemoryUserRepository.create(storekeeper);

    const estimator = makeUser({ contractId: contract.id });
    inMemoryUserRepository.create(estimator);

    const material = makeMaterial();
    inMemoryMaterialRepository.create(material);

    const newProject = makeProject({
      project_number: "Obra-teste",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(newProject);

    const newMovimentation1 = makeMovimentation({
      projectId: newProject.id,
      baseId: base.id,
      materialId: material.id,
      storekeeperId: storekeeper.id,
    });
    const newMovimentation2 = makeMovimentation({
      projectId: newProject.id,
      baseId: base.id,
      materialId: material.id,
      storekeeperId: storekeeper.id,
    });
    const newMovimentation3 = makeMovimentation({
      projectId: newProject.id,
      baseId: base.id,
      materialId: material.id,
      storekeeperId: storekeeper.id,
    });

    await inMemoryMovimentationRepository.create([
      newMovimentation1,
      newMovimentation2,
      newMovimentation3,
    ]);

    const newBudget1 = makeBudget({
      projectId: newProject.id,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });
    const newBudget2 = makeBudget({
      projectId: newProject.id,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });
    const newBudget3 = makeBudget({
      projectId: newProject.id,
      contractId: contract.id,
      materialId: material.id,
      estimatorId: estimator.id,
    });

    await inMemoryBudgetRepository.create([newBudget1]);
    await inMemoryBudgetRepository.create([newBudget2]);
    await inMemoryBudgetRepository.create([newBudget3]);

    const result = await sut.execute({
      project_number: "Obra-teste2",
      baseId: base.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
