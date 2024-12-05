import { beforeEach, describe, expect, it } from "vitest";
import { RequestStagingUseCase } from "./request-staging";
import { InMemoryStagingRepository } from "../../../../../../test/repositories/in-memory-staging-repository";
import { ResourceAlreadyRegisteredError } from "../../../../../core/errors/errors/resource-already-registered-error";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeBase } from "test/factories/make-base";
import { makeStaging } from "test/factories/make-staging";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { InMemoryUserRepository } from "test/repositories/in-memory-user-repository";
import { makeUser } from "test/factories/make-user";
import { makeProject } from "test/factories/make-project";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryStagingRepository: InMemoryStagingRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let sut: RequestStagingUseCase;

describe("Create staging", () => {
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
    inMemoryStagingRepository = new InMemoryStagingRepository();
    sut = new RequestStagingUseCase(
      inMemoryStagingRepository,
      inMemoryBaseRepository,
      inMemoryProjectRepository,
      inMemoryUserRepository
    );
  });

  it("should be able to create a staging", async () => {
    const base = makeBase({ baseName: "Base Teste" });
    await inMemoryBaseRepository.create(base);

    const user = makeUser({ type: "Supervisor", baseId: base.id });
    await inMemoryUserRepository.create(user);

    const project = makeProject({
      baseId: base.id,
      project_number: "Projeto-Separação",
    });
    await inMemoryProjectRepository.create(project);

    const result = await sut.execute({
      supervisorId: user.id.toString(),
      baseId: base.id.toString(),
      type: "CONCRETO",
      project_number: "Projeto-Separação",
      lootDate: new Date(2024, 11, 5),
      observation: "Observação teste",
      origin: "ORÇAMENTO",
      transport: "CARRETA",
      delivery: "REGIÃO",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.staging.stage).toEqual("AGUARDANDO PROGRAMAÇÃO");
      expect(result.value.staging.identifier).toEqual("000001_Bas");
    }
  });

  it("should not be able to create a staging if any of the Ids is not found", async () => {
    const result = await sut.execute({
      supervisorId: "user-id",
      baseId: "base-idoh, m",
      type: "CONCRETO",
      project_number: "Projeto-Separação",
      lootDate: new Date(2024, 11, 5),
      observation: "Observação teste",
      origin: "ORÇAMENTO",
      transport: "CARRETA",
      delivery: "REGIÃO",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should be able to create a staging and auto increment the identifier by base", async () => {
    const base = makeBase({ baseName: "Base Teste" });
    await inMemoryBaseRepository.create(base);

    const user = makeUser({ type: "Supervisor", baseId: base.id });
    await inMemoryUserRepository.create(user);

    const project = makeProject({
      baseId: base.id,
      project_number: "Projeto-Separação",
    });
    await inMemoryProjectRepository.create(project);

    for (let i = 0; i < 55; i++) {
      const staging = makeStaging({
        baseId: base.id,
        projectId: project.id,
        supervisorId: user.id,
      });
      await inMemoryStagingRepository.create(staging);
    }

    const result = await sut.execute({
      supervisorId: user.id.toString(),
      baseId: base.id.toString(),
      type: "CONCRETO",
      project_number: "Projeto-Separação",
      lootDate: new Date(2024, 11, 5),
      observation: "Observação teste",
      origin: "ORÇAMENTO",
      transport: "CARRETA",
      delivery: "REGIÃO",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.staging.identifier).toEqual("000056_Bas");
    }
  });
});
