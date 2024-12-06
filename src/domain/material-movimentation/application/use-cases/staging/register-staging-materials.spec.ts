import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStagingRepository } from "../../../../../../test/repositories/in-memory-staging-repository";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeBase } from "test/factories/make-base";
import { makeStaging } from "test/factories/make-staging";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { InMemoryUserRepository } from "test/repositories/in-memory-user-repository";
import { makeUser } from "test/factories/make-user";
import { makeProject } from "test/factories/make-project";
import { RegisterStagingMaterialsUseCase } from "./register-staging-materials";
import { InMemoryStagingMaterialRepository } from "test/repositories/in-memory-staging-material-repository";
import { InMemoryMaterialRepository } from "test/repositories/in-memory-material-repository";
import { makeMaterial } from "test/factories/make-material";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryStagingRepository: InMemoryStagingRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryMaterialRepository: InMemoryMaterialRepository;
let inMemoryStagingMaterialRepository: InMemoryStagingMaterialRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let sut: RegisterStagingMaterialsUseCase;

describe("register Staging Materials", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryUserRepository = new InMemoryUserRepository(
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
    inMemoryProjectRepository = new InMemoryProjectRepository(
      inMemoryBaseRepository
    );
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    inMemoryStagingRepository = new InMemoryStagingRepository(
      inMemoryUserRepository,
      inMemoryProjectRepository,
      inMemoryBaseRepository
    );
    inMemoryStagingMaterialRepository = new InMemoryStagingMaterialRepository();
    sut = new RegisterStagingMaterialsUseCase(
      inMemoryStagingMaterialRepository,
      inMemoryStagingRepository,
      inMemoryProjectRepository,
      inMemoryMaterialRepository
    );
  });

  it("should be able to register a staging Material list", async () => {
    const base = makeBase({ baseName: "Base Teste" });
    await inMemoryBaseRepository.create(base);

    const project = makeProject({
      baseId: base.id,
      project_number: "Projeto-Separação",
    });
    await inMemoryProjectRepository.create(project);

    const material = makeMaterial({ contractId: base.contractId });
    await inMemoryMaterialRepository.create(material);

    const staging = makeStaging({ baseId: base.id, projectId: project.id });
    await inMemoryStagingRepository.create(staging);

    const result = await sut.execute([
      {
        materialId: material.id.toString(),
        projectId: project.id.toString(),
        stagingId: staging.id.toString(),
        value: 2,
      },
      {
        materialId: material.id.toString(),
        projectId: project.id.toString(),
        stagingId: staging.id.toString(),
        value: 5,
      },
    ]);

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.stagingMaterials[0].value).toEqual(2);
      expect(result.value.stagingMaterials).toHaveLength(2);
    }
  });

  it("should not be able to register a staging material list if at least one of parameters is not found", async () => {
    const base = makeBase({ baseName: "Base Teste" });
    await inMemoryBaseRepository.create(base);

    const project = makeProject({
      baseId: base.id,
      project_number: "Projeto-Separação",
    });
    await inMemoryProjectRepository.create(project);

    const material = makeMaterial({ contractId: base.contractId });
    await inMemoryMaterialRepository.create(material);

    const staging = makeStaging({ baseId: base.id, projectId: project.id });
    await inMemoryStagingRepository.create(staging);

    const result = await sut.execute([
      {
        materialId: material.id.toString(),
        projectId: project.id.toString(),
        stagingId: staging.id.toString(),
        value: 2,
      },
      {
        materialId: "material-id",
        projectId: "project-id",
        stagingId: "staging-id",
        value: 5,
      },
    ]);

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
