import { beforeEach, describe, expect, it } from "vitest";
import { FetchPhysicalDocumentUseCase } from "./fetch-physical-document";
import { InMemoryPhysicalDocumentRepository } from "../../../../../../test/repositories/in-memory-physical-document-repository";
import { makePhysicalDocument } from "../../../../../../test/factories/make-physical-document";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { makeProject } from "test/factories/make-project";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeBase } from "test/factories/make-base";
import { makeContract } from "test/factories/make-contract";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryPhysicalDocumentRepository: InMemoryPhysicalDocumentRepository;
let sut: FetchPhysicalDocumentUseCase;

describe("Fetch PhysicalDocuments History", () => {
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
    sut = new FetchPhysicalDocumentUseCase(
      inMemoryPhysicalDocumentRepository,
      inMemoryProjectRepository
    );
  });

  it("should be able to fetch physical documents history sorting by identifier", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project = makeProject({ baseId: base.id, type: "Obra" });
    await inMemoryProjectRepository.create(project);

    const newPhysicalDocument1 = makePhysicalDocument({
      identifier: 3,
      projectId: project.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });
    const newPhysicalDocument2 = makePhysicalDocument({
      identifier: 10,
      projectId: project.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });
    const newPhysicalDocument3 = makePhysicalDocument({
      identifier: 1,
      projectId: project.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });

    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument1);
    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument2);
    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument3);

    const result = await sut.execute({
      page: 1,
      baseId: base.id.toString(),
      contractId: contract.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.physicalDocuments).toEqual([
        expect.objectContaining({
          props: expect.objectContaining({ identifier: 10 }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({ identifier: 3 }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({ identifier: 1 }),
        }),
      ]);
  });

  it("should be able to fetch paginated physicalDocuments history", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project = makeProject({ baseId: base.id, type: "Obra" });
    await inMemoryProjectRepository.create(project);

    for (let i = 1; i <= 45; i++) {
      await inMemoryPhysicalDocumentRepository.create(
        makePhysicalDocument({
          projectId: project.id,
          baseId: base.id,
          projectKitId: undefined,
          projectMeterId: undefined,
        })
      );
    }

    const result = await sut.execute({
      baseId: base.id.toString(),
      page: 2,
      contractId: contract.id.toString(),
    });
    if (result.isRight()) {
      expect(result.value.physicalDocuments).toHaveLength(5);
      expect(result.value.pagination).toMatchObject({
        page: 2,
        pageCount: 40,
        lastPage: 2,
      });
    }
  });

  it("should be able to fetch physicalDocuments history by project", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project1 = await makeProject({
      project_number: "B-1234567",
      baseId: base.id,
      type: "Obra",
    });
    inMemoryProjectRepository.create(project1);

    const project2 = await makeProject({ baseId: base.id });
    inMemoryProjectRepository.create(project2);

    const newPhysicalDocument1 = makePhysicalDocument({
      projectId: project1.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });
    const newPhysicalDocument2 = makePhysicalDocument({
      projectId: project1.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });
    const newPhysicalDocument3 = makePhysicalDocument({
      projectId: project2.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });

    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument1);
    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument2);
    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument3);

    const result = await sut.execute({
      baseId: base.id.toString(),
      page: 1,
      project_number: "B-1234567",
      contractId: contract.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.physicalDocuments).toHaveLength(2);
  });

  it("should not be able to fetch physicalDocuments history of another base", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project1 = await makeProject({
      project_number: "B-1234567",
      baseId: base.id,
      type: "Obra",
    });
    inMemoryProjectRepository.create(project1);

    const project2 = await makeProject({ type: "Obra" });
    inMemoryProjectRepository.create(project2);

    const newPhysicalDocument1 = makePhysicalDocument({
      projectId: project1.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });
    const newPhysicalDocument2 = makePhysicalDocument({
      projectId: project1.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });
    const newPhysicalDocument3 = makePhysicalDocument({
      projectId: project2.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });

    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument1);
    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument2);
    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument3);

    const result = await sut.execute({
      baseId: base.id.toString(),
      page: 1,
      contractId: contract.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.physicalDocuments).toHaveLength(1);
  });

  it("should be able to fetch physicalDocuments history by identifier", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project = makeProject({ baseId: base.id, type: "Obra" });
    await inMemoryProjectRepository.create(project);

    const newPhysicalDocument1 = makePhysicalDocument({
      unitized: false,
      identifier: 10,
      projectId: project.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });
    const newPhysicalDocument2 = makePhysicalDocument({
      unitized: false,
      identifier: 5,
      projectId: project.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });
    const newPhysicalDocument3 = makePhysicalDocument({
      unitized: true,
      identifier: 10,
      projectId: project.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });

    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument1);
    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument2);
    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument3);

    const result = await sut.execute({
      baseId: base.id.toString(),
      page: 1,
      identifier: 10,
      contractId: contract.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.physicalDocuments).toHaveLength(2);
  });

  it("should be able to fetch physicalDocuments history by unitized", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project = makeProject({ baseId: base.id, type: "Obra" });
    await inMemoryProjectRepository.create(project);

    const newPhysicalDocument1 = makePhysicalDocument({
      unitized: false,
      identifier: 10,
      projectId: project.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });
    const newPhysicalDocument2 = makePhysicalDocument({
      unitized: false,
      identifier: 5,
      projectId: project.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });
    const newPhysicalDocument3 = makePhysicalDocument({
      unitized: true,
      identifier: 10,
      projectId: project.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });

    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument1);
    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument2);
    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument3);

    const result = await sut.execute({
      baseId: base.id.toString(),
      page: 1,
      unitized: true,
      contractId: contract.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.physicalDocuments).toHaveLength(1);
  });

  it("should be able to fetch physicalDocuments history by Kit project", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project1 = await makeProject({
      project_number: "B-1234567",
      baseId: base.id,
      type: "Kit",
    });
    inMemoryProjectRepository.create(project1);

    const project2 = await makeProject({ baseId: base.id, type: "Obra" });
    inMemoryProjectRepository.create(project2);

    const newPhysicalDocument1 = makePhysicalDocument({
      projectId: project2.id,
      baseId: base.id,
      projectKitId: project1.id,
      projectMeterId: undefined,
    });
    const newPhysicalDocument2 = makePhysicalDocument({
      projectId: project1.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });

    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument1);
    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument2);

    const result = await sut.execute({
      baseId: base.id.toString(),
      page: 1,
      project_number: "B-1234567",
      contractId: contract.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.physicalDocuments).toHaveLength(1);
  });

  it("should be able to fetch physicalDocuments history by Meter project", async () => {
    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const project1 = await makeProject({
      project_number: "B-1234567",
      baseId: base.id,
      type: "Medidor",
    });
    inMemoryProjectRepository.create(project1);

    const project2 = await makeProject({ baseId: base.id, type: "Obra" });
    inMemoryProjectRepository.create(project2);

    const newPhysicalDocument1 = makePhysicalDocument({
      projectId: project2.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: project1.id,
    });
    const newPhysicalDocument2 = makePhysicalDocument({
      projectId: project1.id,
      baseId: base.id,
      projectKitId: undefined,
      projectMeterId: undefined,
    });

    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument1);
    await inMemoryPhysicalDocumentRepository.create(newPhysicalDocument2);

    const result = await sut.execute({
      baseId: base.id.toString(),
      page: 1,
      project_number: "B-1234567",
      contractId: contract.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.physicalDocuments).toHaveLength(1);
  });
});
