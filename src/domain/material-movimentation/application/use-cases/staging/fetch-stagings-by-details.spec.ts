import { beforeEach, describe, expect, it } from "vitest";
import { makeMovimentation } from "../../../../../../test/factories/make-movimentation";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { InMemoryUserRepository } from "test/repositories/in-memory-user-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeContract } from "test/factories/make-contract";
import { makeBase } from "test/factories/make-base";
import { makeUser } from "test/factories/make-user";
import { makeMaterial } from "test/factories/make-material";
import { makeProject } from "test/factories/make-project";
import { InMemoryStagingRepository } from "test/repositories/in-memory-staging-repository";
import { FetchStagingUseCase } from "./fetch-stagings-by-details";
import { makeStaging } from "test/factories/make-staging";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryStagingRepository: InMemoryStagingRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let sut: FetchStagingUseCase;

describe("Fetch Staging by Details", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryProjectRepository = new InMemoryProjectRepository(
      inMemoryBaseRepository
    );
    inMemoryUserRepository = new InMemoryUserRepository(
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
    inMemoryStagingRepository = new InMemoryStagingRepository(
      inMemoryUserRepository,
      inMemoryProjectRepository,
      inMemoryBaseRepository
    );
    sut = new FetchStagingUseCase(
      inMemoryStagingRepository,
      inMemoryBaseRepository,
      inMemoryProjectRepository,
      inMemoryUserRepository
    );
  });

  it("should be able to fetch stagings sorting by date", async () => {
    const base = makeBase({}, new UniqueEntityID("base-1"));
    await inMemoryBaseRepository.create(base);

    const user = makeUser({ type: "Supervisor", baseId: base.id });
    await inMemoryUserRepository.create(user);

    const project = makeProject({
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project);

    const staging1 = makeStaging({
      baseId: base.id,
      projectId: project.id,
      supervisorId: user.id,
      createdAt: new Date(2024, 11, 6),
    });
    await inMemoryStagingRepository.create(staging1);

    const staging2 = makeStaging({
      baseId: base.id,
      projectId: project.id,
      supervisorId: user.id,
      createdAt: new Date(2024, 11, 7),
    });
    await inMemoryStagingRepository.create(staging2);

    const result = await sut.execute({
      page: 1,
      baseId: "base-1",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.stagings).toEqual([
        expect.objectContaining({
          props: expect.objectContaining({ createdAt: new Date(2024, 11, 7) }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({ createdAt: new Date(2024, 11, 6) }),
        }),
      ]);
  });

  it("should be able to fetch paginated stagings", async () => {
    const base = makeBase({}, new UniqueEntityID("base-1"));
    await inMemoryBaseRepository.create(base);

    const user = makeUser({ type: "Supervisor", baseId: base.id });
    await inMemoryUserRepository.create(user);

    const project = makeProject({
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project);

    for (let i = 1; i <= 45; i++) {
      const staging = makeStaging({
        baseId: base.id,
        projectId: project.id,
        supervisorId: user.id,
      });
      await inMemoryStagingRepository.create(staging);
    }

    const result = await sut.execute({
      page: 2,
      baseId: "base-1",
    });
    if (result.isRight()) {
      expect(result.value.stagings).toHaveLength(5);
      expect(result.value.pagination).toMatchObject({
        page: 2,
        pageCount: 40,
        lastPage: 2,
      });
    }
  });

  it("should be able to fetch staging by project_number", async () => {
    const base = makeBase({}, new UniqueEntityID("base-1"));
    await inMemoryBaseRepository.create(base);

    const user = makeUser({ type: "Supervisor", baseId: base.id });
    await inMemoryUserRepository.create(user);

    const project = makeProject({
      project_number: "PROJETO-TESTE",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project);

    const project2 = makeProject({
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project2);

    const staging1 = makeStaging({
      baseId: base.id,
      projectId: project.id,
      supervisorId: user.id,
      createdAt: new Date(2024, 11, 6),
    });
    await inMemoryStagingRepository.create(staging1);

    const staging2 = makeStaging({
      baseId: base.id,
      projectId: project.id,
      supervisorId: user.id,
      createdAt: new Date(2024, 11, 7),
    });
    await inMemoryStagingRepository.create(staging2);

    const staging3 = makeStaging({
      baseId: base.id,
      projectId: project2.id,
      supervisorId: user.id,
      createdAt: new Date(2024, 11, 7),
    });
    await inMemoryStagingRepository.create(staging3);

    const result = await sut.execute({
      page: 1,
      baseId: "base-1",
      project_number: "PROJETO-TESTE",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.stagings).toHaveLength(2);
  });

  it("should be able to fetch stagings history by identifier", async () => {
    const base = makeBase({}, new UniqueEntityID("base-1"));
    await inMemoryBaseRepository.create(base);

    const user = makeUser({ type: "Supervisor", baseId: base.id });
    await inMemoryUserRepository.create(user);

    const project = makeProject({
      project_number: "PROJETO-TESTE",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project);

    const project2 = makeProject({
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project2);

    const staging1 = makeStaging({
      baseId: base.id,
      projectId: project.id,
      supervisorId: user.id,
      createdAt: new Date(2024, 11, 6),
    });
    await inMemoryStagingRepository.create(staging1);

    const staging2 = makeStaging({
      baseId: base.id,
      projectId: project.id,
      supervisorId: user.id,
      createdAt: new Date(2024, 11, 7),
      identifier: "000007_Vit",
    });
    await inMemoryStagingRepository.create(staging2);

    const staging3 = makeStaging({
      baseId: base.id,
      projectId: project2.id,
      supervisorId: user.id,
      createdAt: new Date(2024, 11, 7),
    });
    await inMemoryStagingRepository.create(staging3);

    const result = await sut.execute({
      page: 1,
      baseId: "base-1",
      identifier: "000007_Vit",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.stagings).toHaveLength(1);
  });

  it("should be able to fetch staging by supervisor's name", async () => {
    const base = makeBase({}, new UniqueEntityID("base-1"));
    await inMemoryBaseRepository.create(base);

    const user = makeUser({
      name: "JOAO DA SILVA",
      type: "Supervisor",
      baseId: base.id,
    });
    await inMemoryUserRepository.create(user);

    const user2 = makeUser({
      name: "JOAO DOS SANTOS",
      type: "Supervisor",
      baseId: base.id,
    });
    await inMemoryUserRepository.create(user2);

    const user3 = makeUser({
      name: "CICLANO DA SILVA",
      type: "Supervisor",
      baseId: base.id,
    });
    await inMemoryUserRepository.create(user3);

    const project = makeProject({
      project_number: "PROJETO-TESTE",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project);

    const staging1 = makeStaging({
      baseId: base.id,
      projectId: project.id,
      supervisorId: user.id,
      createdAt: new Date(2024, 11, 6),
    });
    await inMemoryStagingRepository.create(staging1);

    const staging2 = makeStaging({
      baseId: base.id,
      projectId: project.id,
      supervisorId: user2.id,
      createdAt: new Date(2024, 11, 7),
    });
    await inMemoryStagingRepository.create(staging2);

    const staging3 = makeStaging({
      baseId: base.id,
      projectId: project.id,
      supervisorId: user3.id,
      createdAt: new Date(2024, 11, 7),
    });
    await inMemoryStagingRepository.create(staging3);

    const result = await sut.execute({
      page: 1,
      baseId: "base-1",
      supervisorName: "JOAO",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.stagings).toHaveLength(2);
  });

  it("should be able to fetch staging by a range of dates", async () => {
    const base = makeBase({}, new UniqueEntityID("base-1"));
    await inMemoryBaseRepository.create(base);

    const user = makeUser({ type: "Supervisor", baseId: base.id });
    await inMemoryUserRepository.create(user);

    const project = makeProject({
      project_number: "PROJETO-TESTE",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project);

    const staging1 = makeStaging({
      baseId: base.id,
      projectId: project.id,
      supervisorId: user.id,
      createdAt: new Date(2024, 11, 6),
    });
    await inMemoryStagingRepository.create(staging1);

    const staging2 = makeStaging({
      baseId: base.id,
      projectId: project.id,
      supervisorId: user.id,
      createdAt: new Date(2024, 11, 7),
    });
    await inMemoryStagingRepository.create(staging2);

    const staging3 = makeStaging({
      baseId: base.id,
      projectId: project.id,
      supervisorId: user.id,
      createdAt: new Date(2024, 11, 8),
    });
    await inMemoryStagingRepository.create(staging3);

    const result = await sut.execute({
      page: 1,
      baseId: "base-1",
      startDate: new Date(2024, 11, 7),
      endDate: new Date(2024, 11, 8),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.stagings).toHaveLength(2);
  });
});
