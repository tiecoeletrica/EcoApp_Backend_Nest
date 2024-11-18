import { beforeEach, describe, expect, it } from "vitest";
import { DeletePhysicalDocumentUseCase } from "./delete-physical-document";
import { InMemoryPhysicalDocumentRepository } from "../../../../../../test/repositories/in-memory-physical-document-repository";
import { makePhysicalDocument } from "../../../../../../test/factories/make-physical-document";
import { NotAllowedError } from "../../../../../core/errors/errors/not-allowed-error";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryPhysicalDocumentRepository: InMemoryPhysicalDocumentRepository;
let sut: DeletePhysicalDocumentUseCase;

describe("Delete PhysicalDocument", () => {
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
    sut = new DeletePhysicalDocumentUseCase(inMemoryPhysicalDocumentRepository);
  });

  it("should be able to delete a physicaldocument", async () => {
    const physicaldocument = makePhysicalDocument();

    await inMemoryPhysicalDocumentRepository.create(physicaldocument);

    await sut.execute({
      physicalDocumentId: physicaldocument.id.toString(),
    });

    expect(inMemoryPhysicalDocumentRepository.items).toHaveLength(0); // there'll be only the author
  });
});
