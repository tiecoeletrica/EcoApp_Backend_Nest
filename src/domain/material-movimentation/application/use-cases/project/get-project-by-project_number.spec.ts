import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeContract } from "test/factories/make-contract";
import { makeBase } from "test/factories/make-base";
import { makeProject } from "test/factories/make-project";
import { GetProjectByProjectNumberUseCase } from "./get-project-by-project_number";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";

let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryContractRepository: InMemoryContractRepository;
let sut: GetProjectByProjectNumberUseCase;

describe("Fetch Movimentations History", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryProjectRepository = new InMemoryProjectRepository(
      inMemoryBaseRepository
    );

    sut = new GetProjectByProjectNumberUseCase(inMemoryProjectRepository);
  });

  it("should be able to get a project by a project number", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project = makeProject({ baseId: base.id, project_number: "B-test" });
    await inMemoryProjectRepository.create(project);

    const result = await sut.execute({
      project_number: "B-test",
      contractId: contract.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.project.project_number).toEqual("B-test");
  });

  it("should not be able to get a project by a project number that does not exist", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project = makeProject({
      baseId: base.id,
      project_number: "B-test-created",
    });
    await inMemoryProjectRepository.create(project);

    const result = await sut.execute({
      project_number: "B-test-not-created",
      contractId: contract.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
