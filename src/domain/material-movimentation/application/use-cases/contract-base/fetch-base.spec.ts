import { beforeEach, describe, expect, it } from "vitest";
import { FetchBaseUseCase } from "./fetch-base";
import { InMemoryBaseRepository } from "../../../../../../test/repositories/in-memory-base-repository";
import { makeBase } from "../../../../../../test/factories/make-base";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeContract } from "test/factories/make-contract";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let sut: FetchBaseUseCase;

describe("Fetch Bases History", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    sut = new FetchBaseUseCase(inMemoryBaseRepository);
  });

  it("should be able to fetch physical documents history sorting by baseName", async () => {
    const contract = makeContract({ contractName: "Centro-Oeste" });

    inMemoryContractRepository.create(contract);

    const newBase1 = makeBase({
      baseName: "Conquista",
      contractId: contract.id,
    });
    const newBase2 = makeBase({
      baseName: "Petrolina",
      contractId: contract.id,
    });
    const newBase3 = makeBase({
      baseName: "Itaberaba",
      contractId: contract.id,
    });

    await inMemoryBaseRepository.create(newBase1);
    await inMemoryBaseRepository.create(newBase2);
    await inMemoryBaseRepository.create(newBase3);

    const result = await sut.execute({
      page: 1,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.bases).toEqual([
        expect.objectContaining({
          props: expect.objectContaining({
            baseName: "Conquista",
            contract: expect.objectContaining({ contractName: "Centro-Oeste" }),
          }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({
            baseName: "Itaberaba",
            contract: expect.objectContaining({ contractName: "Centro-Oeste" }),
          }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({
            baseName: "Petrolina",
            contract: expect.objectContaining({ contractName: "Centro-Oeste" }),
          }),
        }),
      ]);
  });

  it("should be able to fetch paginated bases", async () => {
    const contract = makeContract({ contractName: "Centro-Oeste" });

    inMemoryContractRepository.create(contract);

    for (let i = 1; i <= 45; i++) {
      await inMemoryBaseRepository.create(
        makeBase({ contractId: contract.id })
      );
    }

    const result = await sut.execute({
      page: 2,
    });
    if (result.isRight()) {
      expect(result.value.bases).toHaveLength(5);
      expect(result.value.pagination).toMatchObject({
        page: 2,
        pageCount: 40,
        lastPage: 2,
      });
    }
  });
});
