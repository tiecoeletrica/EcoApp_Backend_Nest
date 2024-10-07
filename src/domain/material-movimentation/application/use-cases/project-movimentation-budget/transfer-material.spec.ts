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
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

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

    const storekeeper = makeUser(
      { baseId: base.id },
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
});
