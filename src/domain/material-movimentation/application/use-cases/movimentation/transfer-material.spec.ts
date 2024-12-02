import { beforeEach, describe, expect, it } from "vitest";
import { TransferMaterialUseCase } from "./transfer-material";
import { InMemoryMovimentationRepository } from "../../../../../../test/repositories/in-memory-movimentation-repository";
import { InMemoryUserRepository } from "test/repositories/in-memory-user-repository";
import { InMemoryMaterialRepository } from "test/repositories/in-memory-material-repository";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeProject } from "test/factories/make-project";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { makeUser } from "test/factories/make-user";
import { makeMaterial } from "test/factories/make-material";
import { makeBase } from "test/factories/make-base";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { NotValidError } from "../../../../../core/errors/errors/not-valid-error";
import { makeContract } from "test/factories/make-contract";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryMaterialRepository: InMemoryMaterialRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryMovimentationRepository: InMemoryMovimentationRepository;
let sut: TransferMaterialUseCase;

describe("Transfer Material", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryProjectRepository = new InMemoryProjectRepository(
      inMemoryBaseRepository
    );
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    inMemoryUserRepository = new InMemoryUserRepository(
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
    inMemoryMovimentationRepository = new InMemoryMovimentationRepository(
      inMemoryUserRepository,
      inMemoryMaterialRepository,
      inMemoryProjectRepository,
      inMemoryBaseRepository
    );
    sut = new TransferMaterialUseCase(
      inMemoryMovimentationRepository,
      inMemoryUserRepository,
      inMemoryMaterialRepository,
      inMemoryProjectRepository,
      inMemoryBaseRepository
    );
  });

  it("should be able to transfer a material", async () => {
    const project = makeProject({}, new UniqueEntityID("1"));
    await inMemoryProjectRepository.create(project);

    const material = makeMaterial({}, new UniqueEntityID("4"));
    await inMemoryMaterialRepository.create(material);

    const base = makeBase({}, new UniqueEntityID("ID-BASE-VCA"));
    await inMemoryBaseRepository.create(base);

    const storekeeper = makeUser({ baseId: base.id }, new UniqueEntityID("5"));
    await inMemoryUserRepository.create(storekeeper);

    const result = await sut.execute([
      {
        projectId: "1",
        materialId: "4",
        storekeeperId: "5",
        observation: "Material Movimentado",
        baseId: "ID-BASE-VCA",
        value: 5,
      },
    ]);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.movimentations[0].value).toEqual(5);
      expect(result.value.movimentations[0].observation).toEqual(
        "Material Movimentado"
      );
    }
    expect(inMemoryMovimentationRepository.items[0].id).toBeTruthy();
  });

  it("should not be able to transfer a material if informed Ids are not found", async () => {
    const result = await sut.execute([
      {
        projectId: "1",
        materialId: "4",
        storekeeperId: "5",
        observation: "Material Movimentado",
        baseId: "ID-BASE-VCA",
        value: 5,
      },
    ]);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not be able to transfer a material there is no informed CIAs on observation", async () => {
    const project = makeProject({}, new UniqueEntityID("1"));
    await inMemoryProjectRepository.create(project);

    const material = makeMaterial(
      { type: "EQUIPAMENTO" },
      new UniqueEntityID("4")
    );
    await inMemoryMaterialRepository.create(material);

    const base = makeBase({}, new UniqueEntityID("ID-BASE-VCA"));
    await inMemoryBaseRepository.create(base);

    const storekeeper = makeUser({ baseId: base.id }, new UniqueEntityID("5"));
    await inMemoryUserRepository.create(storekeeper);

    const result = await sut.execute([
      {
        projectId: "1",
        materialId: "4",
        storekeeperId: "5",
        observation: "CIA: 32918392192",
        baseId: "ID-BASE-VCA",
        value: 2,
      },
    ]);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotValidError);
  });

  it("should not be able to transfer a equipment material if there is no informed CIAs on observation", async () => {
    const project = makeProject({}, new UniqueEntityID("1"));
    await inMemoryProjectRepository.create(project);

    const material = makeMaterial(
      { type: "EQUIPAMENTO" },
      new UniqueEntityID("4")
    );
    await inMemoryMaterialRepository.create(material);

    const base = makeBase({}, new UniqueEntityID("ID-BASE-VCA"));
    await inMemoryBaseRepository.create(base);

    const storekeeper = makeUser({ baseId: base.id }, new UniqueEntityID("5"));
    await inMemoryUserRepository.create(storekeeper);

    const result = await sut.execute([
      {
        projectId: "1",
        materialId: "4",
        storekeeperId: "5",
        observation: "CIA: 32918392192, CIA: 6456456456",
        baseId: "ID-BASE-VCA",
        value: 1.5,
      },
    ]);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotValidError);
  });

  it("should be able to transfer a equipment material if there is no informed CIAs on observation and if validation is skiped ", async () => {
    const project = makeProject({}, new UniqueEntityID("1"));
    await inMemoryProjectRepository.create(project);

    const material = makeMaterial(
      { type: "EQUIPAMENTO" },
      new UniqueEntityID("4")
    );
    await inMemoryMaterialRepository.create(material);

    const base = makeBase({}, new UniqueEntityID("ID-BASE-VCA"));
    await inMemoryBaseRepository.create(base);

    const storekeeper = makeUser({ baseId: base.id }, new UniqueEntityID("5"));
    await inMemoryUserRepository.create(storekeeper);

    const result = await sut.execute([
      {
        projectId: "1",
        materialId: "4",
        storekeeperId: "5",
        observation: "",
        baseId: "ID-BASE-VCA",
        value: 1.5,
        ignoreValidations: true,
      },
    ]);

    expect(result.isRight()).toBe(true);
  });

  it("should be able to transfer a material and register on Project the modification date", async () => {
    const startDate = new Date();

    // sleep for startDate to be different from createdAt
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    await sleep(100);

    const contract = makeContract({}, new UniqueEntityID("ID-CONTRACT-BA"));
    await inMemoryContractRepository.create(contract);

    const base = makeBase(
      { contractId: contract.id },
      new UniqueEntityID("ID-BASE-VCA")
    );
    await inMemoryBaseRepository.create(base);

    const project1 = makeProject(
      { baseId: base.id, firstMovimentationRegister: startDate },
      new UniqueEntityID("1")
    );
    await inMemoryProjectRepository.create(project1);

    const project2 = makeProject({ baseId: base.id }, new UniqueEntityID("2"));
    await inMemoryProjectRepository.create(project2);

    const material = makeMaterial(
      { contractId: contract.id },
      new UniqueEntityID("4")
    );
    await inMemoryMaterialRepository.create(material);

    const storekeeper = makeUser(
      { baseId: base.id, contractId: contract.id },
      new UniqueEntityID("5")
    );
    await inMemoryUserRepository.create(storekeeper);

    const result = await sut.execute([
      {
        projectId: "1",
        materialId: "4",
        storekeeperId: "5",
        observation: "Material Movimentado",
        baseId: "ID-BASE-VCA",
        value: 5,
      },
      {
        projectId: "2",
        materialId: "4",
        storekeeperId: "5",
        observation: "Material Movimentado",
        baseId: "ID-BASE-VCA",
        value: 5,
      },
    ]);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(
        areDatesEqualIgnoringMilliseconds(
          inMemoryProjectRepository.items[0].firstMovimentationRegister!,
          startDate
        )
      ).toBeTruthy();
      expect(
        areDatesEqualIgnoringMilliseconds(
          inMemoryProjectRepository.items[0].lastMovimentationRegister!,
          inMemoryMovimentationRepository.items[0].createdAt
        )
      ).toBeTruthy();
      expect(
        areDatesEqualIgnoringMilliseconds(
          inMemoryProjectRepository.items[1].firstMovimentationRegister!,
          inMemoryMovimentationRepository.items[1].createdAt
        )
      ).toBeTruthy();
      expect(
        areDatesEqualIgnoringMilliseconds(
          inMemoryProjectRepository.items[1].lastMovimentationRegister!,
          inMemoryMovimentationRepository.items[1].createdAt
        )
      ).toBeTruthy();
    }
  });
});

function areDatesEqualIgnoringMilliseconds(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate() &&
    date1.getUTCHours() === date2.getUTCHours() &&
    date1.getUTCMinutes() === date2.getUTCMinutes() &&
    date1.getUTCSeconds() === date2.getUTCSeconds()
  );
}
