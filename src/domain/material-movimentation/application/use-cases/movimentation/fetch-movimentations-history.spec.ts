import { beforeEach, describe, expect, it } from "vitest";
import { FetchMovimentationHistoryUseCase } from "./fetch-movimentations-history";
import { InMemoryMovimentationRepository } from "../../../../../../test/repositories/in-memory-movimentation-repository";
import { makeMovimentation } from "../../../../../../test/factories/make-movimentation";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryMaterialRepository } from "test/repositories/in-memory-material-repository";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { InMemoryUserRepository } from "test/repositories/in-memory-user-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeContract } from "test/factories/make-contract";
import { makeBase } from "test/factories/make-base";
import { makeUser } from "test/factories/make-user";
import { makeMaterial } from "test/factories/make-material";
import { makeProject } from "test/factories/make-project";

let inMemoryMovimentationRepository: InMemoryMovimentationRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryMaterialRepository: InMemoryMaterialRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryContractRepository: InMemoryContractRepository;
let sut: FetchMovimentationHistoryUseCase;

describe("Fetch Movimentations History", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    inMemoryProjectRepository = new InMemoryProjectRepository(
      inMemoryBaseRepository
    );
    inMemoryUserRepository = new InMemoryUserRepository(
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
    inMemoryMovimentationRepository = new InMemoryMovimentationRepository(
      inMemoryUserRepository,
      inMemoryMaterialRepository,
      inMemoryProjectRepository,
      inMemoryBaseRepository
    );
    sut = new FetchMovimentationHistoryUseCase(
      inMemoryMovimentationRepository,
      inMemoryProjectRepository,
      inMemoryUserRepository,
      inMemoryMaterialRepository,
      inMemoryBaseRepository
    );
  });

  it("should be able to fetch movimentations history sorting by date", async () => {
    // entity creation for details
    const contract = makeContract();
    inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("base-1")
    );
    inMemoryBaseRepository.create(base);

    const storekeeper = makeUser({ baseId: base.id });
    inMemoryUserRepository.create(storekeeper);

    const material = makeMaterial();
    inMemoryMaterialRepository.create(material);

    const project = makeProject();
    inMemoryProjectRepository.create(project);

    const newMovimentation1 = makeMovimentation({
      createdAt: new Date(2024, 5, 17),
      baseId: base.id,
      materialId: material.id,
      projectId: project.id,
      storekeeperId: storekeeper.id,
    });
    const newMovimentation2 = makeMovimentation({
      createdAt: new Date(2024, 5, 19),
      baseId: base.id,
      materialId: material.id,
      projectId: project.id,
      storekeeperId: storekeeper.id,
    });
    const newMovimentation3 = makeMovimentation({
      createdAt: new Date(2024, 5, 16),
      baseId: base.id,
      materialId: material.id,
      projectId: project.id,
      storekeeperId: storekeeper.id,
    });

    await inMemoryMovimentationRepository.create([
      newMovimentation1,
      newMovimentation2,
      newMovimentation3,
    ]);

    const result = await sut.execute({
      page: 1,
      baseId: "base-1",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.movimentations).toEqual([
        expect.objectContaining({
          props: expect.objectContaining({ createdAt: new Date(2024, 5, 19) }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({ createdAt: new Date(2024, 5, 17) }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({ createdAt: new Date(2024, 5, 16) }),
        }),
      ]);
  });

  it("should be able to fetch paginated movimentations history", async () => {
    // entity creation for details
    const contract = makeContract();
    inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("base-1")
    );
    inMemoryBaseRepository.create(base);

    const storekeeper = makeUser({ baseId: base.id });
    inMemoryUserRepository.create(storekeeper);

    const material = makeMaterial();
    inMemoryMaterialRepository.create(material);

    const project = makeProject();
    inMemoryProjectRepository.create(project);

    for (let i = 1; i <= 45; i++) {
      await inMemoryMovimentationRepository.create([
        makeMovimentation({
          baseId: base.id,
          materialId: material.id,
          projectId: project.id,
          storekeeperId: storekeeper.id,
        }),
      ]);
    }

    const result = await sut.execute({
      page: 2,
      baseId: "base-1",
    });
    if (result.isRight()) {
      expect(result.value.movimentations).toHaveLength(5);
      expect(result.value.pagination).toMatchObject({
        page: 2,
        pageCount: 40,
        lastPage: 2,
      });
    }
  });

  it("should be able to fetch movimentations history by project_number", async () => {
    // entity creation for details
    const contract = makeContract();
    inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("base-1")
    );
    inMemoryBaseRepository.create(base);

    const storekeeper = makeUser({ baseId: base.id });
    inMemoryUserRepository.create(storekeeper);

    const material = makeMaterial();
    inMemoryMaterialRepository.create(material);

    const project = makeProject({
      project_number: "projeto-1",
      baseId: base.id,
    });
    inMemoryProjectRepository.create(project);
    const project2 = makeProject({
      project_number: "projeto-2",
      baseId: base.id,
    });
    inMemoryProjectRepository.create(project2);

    const newMovimentation1 = makeMovimentation({
      baseId: base.id,
      materialId: material.id,
      projectId: project.id,
      storekeeperId: storekeeper.id,
    });
    const newMovimentation2 = makeMovimentation({
      baseId: base.id,
      materialId: material.id,
      projectId: project.id,
      storekeeperId: storekeeper.id,
    });
    const newMovimentation3 = makeMovimentation({
      baseId: base.id,
      materialId: material.id,
      projectId: project2.id,
      storekeeperId: storekeeper.id,
    });

    await inMemoryMovimentationRepository.create([
      newMovimentation1,
      newMovimentation2,
      newMovimentation3,
    ]);

    const result = await sut.execute({
      page: 1,
      baseId: "base-1",
      project_number: "projeto-1",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.movimentations).toHaveLength(2);
  });

  it("should be able to fetch movimentations history by material_code", async () => {
    // entity creation for details
    const contract = makeContract();
    inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("base-1")
    );
    inMemoryBaseRepository.create(base);

    const storekeeper = makeUser({ baseId: base.id });
    inMemoryUserRepository.create(storekeeper);

    const material = makeMaterial({ code: 321564, contractId: contract.id });
    inMemoryMaterialRepository.create(material);
    const material2 = makeMaterial({ code: 111111, contractId: contract.id });
    inMemoryMaterialRepository.create(material2);

    const project = makeProject();
    inMemoryProjectRepository.create(project);

    const newMovimentation1 = makeMovimentation({
      baseId: base.id,
      materialId: material.id,
      projectId: project.id,
      storekeeperId: storekeeper.id,
    });
    const newMovimentation2 = makeMovimentation({
      baseId: base.id,
      materialId: material.id,
      projectId: project.id,
      storekeeperId: storekeeper.id,
    });
    const newMovimentation3 = makeMovimentation({
      baseId: base.id,
      materialId: material2.id,
      projectId: project.id,
      storekeeperId: storekeeper.id,
    });

    await inMemoryMovimentationRepository.create([
      newMovimentation1,
      newMovimentation2,
      newMovimentation3,
    ]);

    const result = await sut.execute({
      page: 1,
      baseId: "base-1",
      material_code: 321564,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.movimentations).toHaveLength(2);
  });

  it("should be able to fetch movimentations history by storekeeper's name", async () => {
    // entity creation for details
    const contract = makeContract();
    inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("base-1")
    );
    inMemoryBaseRepository.create(base);

    const storekeeper = makeUser({
      baseId: base.id,
      name: "João da Silva",
    });
    inMemoryUserRepository.create(storekeeper);
    const storekeeper2 = makeUser({ baseId: base.id });
    inMemoryUserRepository.create(storekeeper2);

    const material = makeMaterial();
    inMemoryMaterialRepository.create(material);

    const project = makeProject();
    inMemoryProjectRepository.create(project);

    const newMovimentation1 = makeMovimentation({
      baseId: base.id,
      materialId: material.id,
      projectId: project.id,
      storekeeperId: storekeeper.id,
    });
    const newMovimentation2 = makeMovimentation({
      baseId: base.id,
      materialId: material.id,
      projectId: project.id,
      storekeeperId: storekeeper.id,
    });
    const newMovimentation3 = makeMovimentation({
      baseId: base.id,
      materialId: material.id,
      projectId: project.id,
      storekeeperId: storekeeper2.id,
    });

    await inMemoryMovimentationRepository.create([
      newMovimentation1,
      newMovimentation2,
      newMovimentation3,
    ]);

    const result = await sut.execute({
      page: 1,
      baseId: "base-1",
      name: "João",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.movimentations).toHaveLength(2);
  });

  it("should be able to fetch movimentations history by a range of dates", async () => {
    // entity creation for details
    const contract = makeContract();
    inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("base-1")
    );
    inMemoryBaseRepository.create(base);

    const storekeeper = makeUser({ baseId: base.id });
    inMemoryUserRepository.create(storekeeper);

    const material = makeMaterial();
    inMemoryMaterialRepository.create(material);

    const project = makeProject();
    inMemoryProjectRepository.create(project);

    const newMovimentation1 = makeMovimentation({
      baseId: base.id,
      materialId: material.id,
      projectId: project.id,
      storekeeperId: storekeeper.id,
      createdAt: new Date(2024, 5, 18),
    });
    const newMovimentation2 = makeMovimentation({
      baseId: base.id,
      materialId: material.id,
      projectId: project.id,
      storekeeperId: storekeeper.id,
      createdAt: new Date(2024, 5, 15),
    });
    const newMovimentation3 = makeMovimentation({
      baseId: base.id,
      materialId: material.id,
      projectId: project.id,
      storekeeperId: storekeeper.id,
      createdAt: new Date(2024, 5, 13),
    });

    await inMemoryMovimentationRepository.create([
      newMovimentation1,
      newMovimentation2,
      newMovimentation3,
    ]);

    const result = await sut.execute({
      page: 1,
      baseId: "base-1",
      startDate: new Date(2024, 5, 13),
      endDate: new Date(2024, 5, 16),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.movimentations).toHaveLength(2);
  });

  it("should be able to fetch movimentations history searching just recent movientations", async () => {
    // entity creation for details
    const contract = makeContract();
    inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("base-1")
    );
    inMemoryBaseRepository.create(base);

    const storekeeper = makeUser({ baseId: base.id });
    inMemoryUserRepository.create(storekeeper);

    const material = makeMaterial();
    inMemoryMaterialRepository.create(material);

    const project = makeProject();
    inMemoryProjectRepository.create(project);

    for (let i = 1; i <= 45; i++) {
      await inMemoryMovimentationRepository.create([
        makeMovimentation({
          baseId: base.id,
          materialId: material.id,
          projectId: project.id,
          storekeeperId: storekeeper.id,
          createdAt: new Date(),
        }),
      ]);
    }

    for (let i = 1; i <= 45; i++) {
      await inMemoryMovimentationRepository.create([
        makeMovimentation({
          baseId: base.id,
          materialId: material.id,
          projectId: project.id,
          storekeeperId: storekeeper.id,
          createdAt: new Date(2000, 5, 5),
        }),
      ]);
    }

    const result = await sut.execute({
      page: 2,
      baseId: "base-1",
    });
    if (result.isRight()) {
      expect(result.value.movimentations).toHaveLength(5);
      expect(result.value.pagination).toMatchObject({
        page: 2,
        pageCount: 40,
        lastPage: 2,
      });
    }
  });
});
