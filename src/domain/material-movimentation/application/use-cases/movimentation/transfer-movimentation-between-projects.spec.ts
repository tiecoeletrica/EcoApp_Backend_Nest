import { beforeEach, describe, expect, it } from "vitest";
import { TransferMovimentationBetweenProjectsUseCase } from "./transfer-movimentation-between-projects";
import { InMemoryMovimentationRepository } from "../../../../../../test/repositories/in-memory-movimentation-repository";
import { makeMovimentation } from "../../../../../../test/factories/make-movimentation";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryUserRepository } from "test/repositories/in-memory-user-repository";
import { InMemoryMaterialRepository } from "test/repositories/in-memory-material-repository";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { makeProject } from "test/factories/make-project";
import { makeMaterial } from "test/factories/make-material";
import { makeBase } from "test/factories/make-base";
import { makeUser } from "test/factories/make-user";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryMaterialRepository: InMemoryMaterialRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryMovimentationRepository: InMemoryMovimentationRepository;
let sut: TransferMovimentationBetweenProjectsUseCase;

describe("Transfer Material between projects", () => {
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
    sut = new TransferMovimentationBetweenProjectsUseCase(
      inMemoryMovimentationRepository,
      inMemoryUserRepository,
      inMemoryMaterialRepository,
      inMemoryProjectRepository,
      inMemoryBaseRepository
    );
  });

  it("should be able to transfer a material between projects", async () => {
    const projectIn = makeProject({}, new UniqueEntityID("Projeto-destino"));
    await inMemoryProjectRepository.create(projectIn);

    const projectOut = makeProject({}, new UniqueEntityID("Projeto-origem"));
    await inMemoryProjectRepository.create(projectOut);

    const material = makeMaterial({}, new UniqueEntityID("Material-teste"));
    await inMemoryMaterialRepository.create(material);

    const base = makeBase({}, new UniqueEntityID("ID-BASE-VCA"));
    await inMemoryBaseRepository.create(base);

    const storekeeper = makeUser(
      { baseId: base.id },
      new UniqueEntityID("5")
    );
    await inMemoryUserRepository.create(storekeeper);

    const movimentation = makeMovimentation({
      projectId: projectOut.id,
      materialId: material.id,
      baseId: base.id,
      storekeeperId: storekeeper.id,
      value: 5,
    });

    await inMemoryMovimentationRepository.create([movimentation]);

    const result = await sut.execute([
      {
        projectIdOut: "Projeto-origem",
        projectIdIn: "Projeto-destino",
        materialId: "Material-teste",
        storekeeperId: "5",
        observation: "transferencia para terminar obra prioritária",
        baseId: "ID-BASE-VCA",
        value: 4,
      },
    ]);

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.movimentationIn[0].value).toEqual(4);
      expect(result.value.movimentationOut[0].value).toEqual(-4);
      expect(result.value.movimentationOut[0].observation).toEqual(
        "transferencia para terminar obra prioritária"
      );
    }
    expect(inMemoryMovimentationRepository.items[0].id).toBeTruthy();
  });

  it("should not be able to transfer a material between projects if the in value is bigger than out value", async () => {
    const projectIn = makeProject({}, new UniqueEntityID("Projeto-destino"));
    await inMemoryProjectRepository.create(projectIn);

    const projectOut = makeProject({}, new UniqueEntityID("Projeto-origem"));
    await inMemoryProjectRepository.create(projectOut);

    const material = makeMaterial({}, new UniqueEntityID("Material-teste"));
    await inMemoryMaterialRepository.create(material);

    const base = makeBase({}, new UniqueEntityID("ID-BASE-VCA"));
    await inMemoryBaseRepository.create(base);

    const storekeeper = makeUser(
      { baseId: base.id },
      new UniqueEntityID("5")
    );
    await inMemoryUserRepository.create(storekeeper);

    const movimentation = makeMovimentation({
      projectId: projectOut.id,
      materialId: material.id,
      baseId: base.id,
      storekeeperId: storekeeper.id,
      value: 3,
    });

    await inMemoryMovimentationRepository.create([movimentation]);

    const result = await sut.execute([
      {
        projectIdOut: "Projeto-origem",
        projectIdIn: "Projeto-destino",
        materialId: "Material-teste",
        storekeeperId: "5",
        observation: "transferencia para terminar obra prioritária",
        baseId: "ID-BASE-VCA",
        value: 4,
      },
    ]);

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not be able to transfer a material between projects if the iformed ids was not found", async () => {
    const movimentation = makeMovimentation({
      projectId: new UniqueEntityID("Projeto-origem"),
      materialId: new UniqueEntityID("Material-teste"),
      baseId: new UniqueEntityID("ID-BASE-VCA"),
      storekeeperId: new UniqueEntityID("5"),
      value: 3,
    });

    await inMemoryMovimentationRepository.create([movimentation]);

    const result = await sut.execute([
      {
        projectIdOut: "Projeto-origem",
        projectIdIn: "Projeto-destino",
        materialId: "Material-teste",
        storekeeperId: "5",
        observation: "transferencia para terminar obra prioritária",
        baseId: "ID-BASE-VCA",
        value: 4,
      },
    ]);

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
