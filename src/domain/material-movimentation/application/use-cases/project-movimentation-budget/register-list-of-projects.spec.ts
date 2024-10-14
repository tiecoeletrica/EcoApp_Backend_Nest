import { beforeEach, describe, expect, it } from "vitest";
import { RegisterListOfProjectsUseCase } from "./register-list-of-projects";
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
let sut: RegisterListOfProjectsUseCase;

describe("Register list of projects", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryProjectRepository = new InMemoryProjectRepository(
      inMemoryBaseRepository
    );
    sut = new RegisterListOfProjectsUseCase(
      inMemoryProjectRepository,
      inMemoryBaseRepository
    );
  });

  it("should be able to register a list projects", async () => {
    const base = makeBase();
    await inMemoryBaseRepository.create(base);

    const result = await sut.execute([
      {
        project_number: "B-10101010",
        description:
          "fazenda-num-sei-das-quantas-POV-onde-judas-perdeu-as-botas",
        type: "obra",
        baseId: base.id.toString(),
        city: "Lagedo do Tabocal",
      },
      {
        project_number: "B-10101005",
        description: "fazenda-num-sei-das-quantas",
        type: "obra",
        baseId: base.id.toString(),
        city: "Lagedo do Tabocal",
      },
    ]);

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.projects).toHaveLength(2);
  });

  it("should not be able to register a project if a project_number of the list is already registered", async () => {
    const base = makeBase();
    await inMemoryBaseRepository.create(base);

    const project = makeProject({
      project_number: "B-10101010",
      baseId: base.id,
    });
    await inMemoryProjectRepository.create(project);

    const result = await sut.execute([
      {
        project_number: "B-10101010",
        description:
          "fazenda-num-sei-das-quantas-POV-onde-judas-perdeu-as-botas",
        type: "obra",
        baseId: base.id.toString(),
        city: "Lagedo do Tabocal",
      },
      {
        project_number: "B-10101005",
        description: "fazenda-num-sei-das-quantas",
        type: "obra",
        baseId: base.id.toString(),
        city: "Lagedo do Tabocal",
      },
    ]);

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceAlreadyRegisteredError);
  });

  it("should not be able to create a project if at least one baseId is not found", async () => {
    const base = makeBase();
    await inMemoryBaseRepository.create(base);

    const result = await sut.execute([
      {
        project_number: "B-10101010",
        description:
          "fazenda-num-sei-das-quantas-POV-onde-judas-perdeu-as-botas",
        type: "obra",
        baseId: "base-that-does-not-exists",
        city: "Lagedo do Tabocal",
      },
      {
        project_number: "B-10101005",
        description: "fazenda-num-sei-das-quantas",
        type: "obra",
        baseId: base.id.toString(),
        city: "Lagedo do Tabocal",
      },
    ]);

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
