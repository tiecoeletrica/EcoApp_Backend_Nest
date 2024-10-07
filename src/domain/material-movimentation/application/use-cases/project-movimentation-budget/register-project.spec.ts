import { beforeEach, describe, expect, it, test } from "vitest";
import { RegisterProjectUseCase } from "./register-project";
import { InMemoryProjectRepository } from "../../../../../../test/repositories/in-memory-project-repository";
import { ResourceAlreadyRegisteredError } from "../errors/resource-already-registered-error";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeBase } from "test/factories/make-base";
import { makeProject } from "test/factories/make-project";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let sut: RegisterProjectUseCase;

describe("Create project", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryProjectRepository = new InMemoryProjectRepository(
      inMemoryBaseRepository
    );
    sut = new RegisterProjectUseCase(
      inMemoryProjectRepository,
      inMemoryBaseRepository
    );
  });

  it("should be able to create a project", async () => {
    const base = makeBase();
    await inMemoryBaseRepository.create(base);

    const result = await sut.execute({
      project_number: "B-10101010",
      description: "fazenda-num-sei-das-quantas-POV-onde-judas-perdeu-as-botas",
      type: "obra",
      baseId: base.id.toString(),
      city: "Lagedo do Tabocal",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value?.project.project_number).toEqual("B-10101010");
      expect(result.value?.project.type).toEqual("obra");
    }
    expect(inMemoryProjectRepository.items[0].id).toBeTruthy();
  });

  it("should not be able to create a project if project_number is already registered", async () => {
    const base = makeBase();
    await inMemoryBaseRepository.create(base);

    const project = makeProject({
      project_number: "B-10101010",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project);

    const result = await sut.execute({
      project_number: "B-10101010",
      description: "fazenda-num-sei-das-quantas-POV-onde-judas-perdeu-as-botas",
      type: "obra",
      baseId: base.id.toString(),
      city: "Lagedo do Tabocal",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceAlreadyRegisteredError);
  });

  it("should not be able to create a project if baseId is not found", async () => {
    const result = await sut.execute({
      project_number: "B-10101010",
      description: "fazenda-num-sei-das-quantas-POV-onde-judas-perdeu-as-botas",
      type: "obra",
      baseId: "base-id-that-doesnt-exist",
      city: "Lagedo do Tabocal",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
