import { beforeEach, describe, expect, it } from "vitest";
import { IdentifierAttributionUseCase } from "./identifier-attribution";
import { InMemoryPhysicalDocumentRepository } from "../../../../../../test/repositories/in-memory-physical-document-repository";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { makeProject } from "test/factories/make-project";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { makePhysicalDocument } from "test/factories/make-physical-document";
import { ResourceAlreadyRegisteredError } from "../errors/resource-already-registered-error";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { makeBase } from "test/factories/make-base";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryPhysicalDocumentRepository: InMemoryPhysicalDocumentRepository;
let sut: IdentifierAttributionUseCase;

describe("attribute a identifier to a physical document", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryProjectRepository = new InMemoryProjectRepository(
      inMemoryBaseRepository
    );
    inMemoryPhysicalDocumentRepository = new InMemoryPhysicalDocumentRepository(
      inMemoryProjectRepository
    );
    sut = new IdentifierAttributionUseCase(
      inMemoryPhysicalDocumentRepository,
      inMemoryProjectRepository
    );
  });

  it("should be able to attribute a identifier to a physical document", async () => {
    const project = makeProject({ project_number: "projeto-1" });
    await inMemoryProjectRepository.create(project);

    const result = await sut.execute({
      project_number: "projeto-1",
      identifier: 123456,
      baseId: project.baseId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.physicalDocument.unitized).toEqual(false);
    }
    expect(inMemoryPhysicalDocumentRepository.items[0].id).toBeTruthy();
  });

  it("should not be able to attribute a identifier to a physical document if identification is already in use", async () => {
    const project = makeProject({ project_number: "projeto-1" });
    await inMemoryProjectRepository.create(project);

    const physicalDocument = makePhysicalDocument({
      identifier: 123456,
      unitized: false,
    });
    await inMemoryPhysicalDocumentRepository.create(physicalDocument);

    const result = await sut.execute({
      project_number: "projeto-1",
      identifier: 123456,
      baseId: project.baseId.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceAlreadyRegisteredError);
  });

  it("should not be able to attribute a identifier to a physical document if project does not exist", async () => {
    const base = makeBase();
    await inMemoryBaseRepository.create(base);

    const result = await sut.execute({
      project_number: "projeto-1-nao-criado",
      identifier: 123456,
      baseId: base.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
