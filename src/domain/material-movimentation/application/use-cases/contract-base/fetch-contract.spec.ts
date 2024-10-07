import { beforeEach, describe, expect, it } from "vitest";
import { FetchContractUseCase } from "./fetch-contract";
import { InMemoryContractRepository } from "../../../../../../test/repositories/in-memory-contract-repository";
import { makeContract } from "../../../../../../test/factories/make-contract";

let inMemoryContractRepository: InMemoryContractRepository;
let sut: FetchContractUseCase;

describe("Fetch Contracts History", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    sut = new FetchContractUseCase(inMemoryContractRepository);
  });

  it("should be able to fetch physical documents history sorting by contractName", async () => {
    const newContract1 = makeContract({
      contractName: "Coelba",
    });
    const newContract2 = makeContract({
      contractName: "Celpe",
    });
    const newContract3 = makeContract({
      contractName: "Equatorial",
    });

    await inMemoryContractRepository.create(newContract1);
    await inMemoryContractRepository.create(newContract2);
    await inMemoryContractRepository.create(newContract3);

    const result = await sut.execute({
      page: 1,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.contracts).toEqual([
        expect.objectContaining({
          props: expect.objectContaining({ contractName: "Celpe" }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({ contractName: "Coelba" }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({ contractName: "Equatorial" }),
        }),
      ]);
  });

  it("should be able to fetch paginated contracts", async () => {
    for (let i = 1; i <= 45; i++) {
      await inMemoryContractRepository.create(makeContract());
    }

    const result = await sut.execute({
      page: 2,
    });
    if (result.isRight()) {
      expect(result.value.contracts).toHaveLength(5);
      expect(result.value.pagination).toMatchObject({
        page: 2,
        pageCount: 40,
        lastPage: 2,
      });
    }
  });
});
