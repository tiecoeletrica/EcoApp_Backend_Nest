import { beforeEach, describe, expect, it, test } from "vitest";
import { UnitizePhysicalDocumentUseCase } from "./unitize-physical-document";
import { InMemoryPhysicalDocumentRepository } from "../../../../../../test/repositories/in-memory-physical-document-repository";
import { makePhysicalDocument } from "../../../../../../test/factories/make-physical-document";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryPhysicalDocumentRepository: InMemoryPhysicalDocumentRepository;
let sut: UnitizePhysicalDocumentUseCase;

describe("Unitize PhysicalDocument", () => {
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
    sut = new UnitizePhysicalDocumentUseCase(
      inMemoryPhysicalDocumentRepository
    );
  });

  it("should be able to unitize a physicaldocument", async () => {
    const physicaldocument = makePhysicalDocument({ unitized: false });

    await inMemoryPhysicalDocumentRepository.create(physicaldocument);

    const result = await sut.execute({
      physicaldDocumentid: physicaldocument.id.toString(),
      unitized: true,
    });

    expect(result.isRight());
    expect(inMemoryPhysicalDocumentRepository.items[0]).toMatchObject({
      props: {
        unitized: true,
      },
    });
  });
});
