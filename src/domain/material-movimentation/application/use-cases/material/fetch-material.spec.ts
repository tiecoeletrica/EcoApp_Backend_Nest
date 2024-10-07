import { beforeEach, describe, expect, it } from "vitest";
import { FetchMaterialUseCase } from "./fetch-material";
import { InMemoryMaterialRepository } from "../../../../../../test/repositories/in-memory-material-repository";
import { makeMaterial } from "../../../../../../test/factories/make-material";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";

let inMemoryMaterialRepository: InMemoryMaterialRepository;
let sut: FetchMaterialUseCase;

describe("Fetch Materials", () => {
  beforeEach(() => {
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    sut = new FetchMaterialUseCase(inMemoryMaterialRepository);
  });

  it("should be able to fetch materials sorting by code", async () => {
    const newMaterial1 = makeMaterial({
      code: 123456,
      contractId: new UniqueEntityID("contrato-1"),
    });
    const newMaterial2 = makeMaterial({
      code: 123451,
      contractId: new UniqueEntityID("contrato-1"),
    });
    const newMaterial3 = makeMaterial({
      code: 123459,
      contractId: new UniqueEntityID("contrato-1"),
    });

    await inMemoryMaterialRepository.create(newMaterial1);
    await inMemoryMaterialRepository.create(newMaterial2);
    await inMemoryMaterialRepository.create(newMaterial3);

    const result = await sut.execute({
      page: 1,
      contractId: "contrato-1",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.materials).toEqual([
        expect.objectContaining({
          props: expect.objectContaining({ code: 123451 }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({ code: 123456 }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({ code: 123459 }),
        }),
      ]);
  });

  it("should be able to fetch paginated materials", async () => {
    for (let i = 1; i <= 45; i++) {
      await inMemoryMaterialRepository.create(
        makeMaterial({ contractId: new UniqueEntityID("contrato-1") })
      );
    }

    const result = await sut.execute({
      page: 2,
      contractId: "contrato-1",
    });
    if (result.isRight()) {
      expect(result.value.materials).toHaveLength(5);
      expect(result.value.pagination).toMatchObject({
        page: 2,
        pageCount: 40,
        lastPage: 2,
      });
    }
  });

  it("should be able to fetch materials by type", async () => {
    const newMaterial1 = makeMaterial({
      type: "CONCRETO",
      contractId: new UniqueEntityID("contrato-1"),
    });
    const newMaterial2 = makeMaterial({
      type: "FERRAGEM",
      contractId: new UniqueEntityID("contrato-1"),
    });
    const newMaterial3 = makeMaterial({
      type: "CONCRETO",
      contractId: new UniqueEntityID("contrato-1"),
    });

    await inMemoryMaterialRepository.create(newMaterial1);
    await inMemoryMaterialRepository.create(newMaterial2);
    await inMemoryMaterialRepository.create(newMaterial3);

    const result = await sut.execute({
      page: 1,
      type: "CONCRETO",
      contractId: "contrato-1",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.materials).toHaveLength(2);
  });

  it("should be able to fetch materials by contract", async () => {
    const newMaterial1 = makeMaterial({
      contractId: new UniqueEntityID("contrato-1"),
    });
    const newMaterial2 = makeMaterial({
      contractId: new UniqueEntityID("contrato-1"),
    });
    const newMaterial3 = makeMaterial({
      contractId: new UniqueEntityID("contrato-2"),
    });

    await inMemoryMaterialRepository.create(newMaterial1);
    await inMemoryMaterialRepository.create(newMaterial2);
    await inMemoryMaterialRepository.create(newMaterial3);

    const result = await sut.execute({
      page: 1,
      contractId: "contrato-1",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.materials).toHaveLength(2);
  });
});
