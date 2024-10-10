import { beforeEach, describe, expect, it } from "vitest";
import { FetchUserUseCase } from "./fetch-user";
import { InMemoryUserRepository } from "../../../../../../test/repositories/in-memory-user-repository";
import { makeUser } from "../../../../../../test/factories/make-user";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeContract } from "test/factories/make-contract";
import { makeBase } from "test/factories/make-base";

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryContractRepository: InMemoryContractRepository;
let sut: FetchUserUseCase;

describe("Fetch Users History", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryUserRepository = new InMemoryUserRepository(
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
    sut = new FetchUserUseCase(inMemoryUserRepository);
  });

  it("should be able to fetch user sorting by name", async () => {
    const contract = makeContract({ contractName: "Centro-Oeste" });
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ baseName: "Itaberaba", contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const newUser1 = makeUser({
      name: "Bruno",
      baseId: base.id,
      contractId: contract.id,
    });
    const newUser2 = makeUser({
      name: "Ana",
      baseId: base.id,
      contractId: contract.id,
    });
    const newUser3 = makeUser({
      name: "Carlos",
      baseId: base.id,
      contractId: contract.id,
    });

    await inMemoryUserRepository.create(newUser1);
    await inMemoryUserRepository.create(newUser2);
    await inMemoryUserRepository.create(newUser3);

    const result = await sut.execute({
      page: 1,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.users).toEqual([
        expect.objectContaining({
          props: expect.objectContaining({ name: "Ana" }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({ name: "Bruno" }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({ name: "Carlos" }),
        }),
      ]);
  });

  it("should be able to fetch paginated users history", async () => {
    const contract = makeContract({ contractName: "Centro-Oeste" });
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ baseName: "Itaberaba", contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    for (let i = 1; i <= 45; i++) {
      await inMemoryUserRepository.create(
        makeUser({ baseId: base.id, contractId: contract.id })
      );
    }

    const result = await sut.execute({
      page: 2,
    });
    if (result.isRight()) {
      expect(result.value.users).toHaveLength(5);
      expect(result.value.pagination).toMatchObject({
        page: 2,
        pageCount: 40,
        lastPage: 2,
      });
    }
  });

  it("should be able to fetch users history by base", async () => {
    const contract1 = makeContract({ contractName: "Centro-Oeste" });
    inMemoryContractRepository.create(contract1);

    const base1 = makeBase({ baseName: "Itaberaba", contractId: contract1.id });
    await inMemoryBaseRepository.create(base1);

    const contract2 = makeContract({ contractName: "Oeste-Pe" });
    await inMemoryContractRepository.create(contract2);

    const base2 = makeBase({
      baseName: "Pernambuco",
      contractId: contract2.id,
    });
    await inMemoryBaseRepository.create(base2);

    const newUser1 = makeUser({
      baseId: base1.id,
      contractId: contract1.id,
    });
    const newUser2 = makeUser({
      baseId: base1.id,
      contractId: contract1.id,
    });
    const newUser3 = makeUser({
      baseId: base2.id,
      contractId: contract2.id,
    });

    await inMemoryUserRepository.create(newUser1);
    await inMemoryUserRepository.create(newUser2);
    await inMemoryUserRepository.create(newUser3);

    const result = await sut.execute({
      page: 1,
      baseId: base1.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.users).toHaveLength(2);
  });

  it("should be able to fetch user by contract", async () => {
    const contract1 = makeContract({ contractName: "Centro-Oeste" });
    await inMemoryContractRepository.create(contract1);

    const base1 = makeBase({ baseName: "Itaberaba", contractId: contract1.id });
    await inMemoryBaseRepository.create(base1);

    const contract2 = makeContract({ contractName: "Oeste-Pe" });
    await inMemoryContractRepository.create(contract2);

    const base2 = makeBase({
      baseName: "Pernambuco",
      contractId: contract2.id,
    });
    await inMemoryBaseRepository.create(base2);

    const newUser1 = makeUser({
      name: "Bruno Carlos",
      baseId: base1.id,
      contractId: contract1.id,
    });
    const newUser2 = makeUser({
      name: "Bruno José",
      baseId: base1.id,
      contractId: contract1.id,
    });
    const newUser3 = makeUser({
      name: "Carlos",
      baseId: base2.id,
      contractId: contract2.id,
    });

    await inMemoryUserRepository.create(newUser1);
    await inMemoryUserRepository.create(newUser2);
    await inMemoryUserRepository.create(newUser3);

    const result = await sut.execute({
      page: 1,
      contractId: contract1.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) expect(result.value.users).toHaveLength(2);
  });

  it("should be able to fetch user by name", async () => {
    const contract = makeContract({ contractName: "Centro-Oeste" });
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ baseName: "Itaberaba", contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const newUser1 = makeUser({
      name: "Bruno Carlos",
      baseId: base.id,
      contractId: contract.id,
    });
    const newUser2 = makeUser({
      name: "Bruno José",
      baseId: base.id,
      contractId: contract.id,
    });
    const newUser3 = makeUser({
      name: "Carlos",
      baseId: base.id,
      contractId: contract.id,
    });

    await inMemoryUserRepository.create(newUser1);
    await inMemoryUserRepository.create(newUser2);
    await inMemoryUserRepository.create(newUser3);

    const result = await sut.execute({
      page: 1,
      name: "Bruno",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.users).toEqual([
        expect.objectContaining({
          props: expect.objectContaining({ name: "Bruno Carlos" }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({ name: "Bruno José" }),
        }),
      ]);
  });

  it("should be able to fetch user by part of name and not case sensitive", async () => {
    const contract = makeContract({ contractName: "Centro-Oeste" });
    await inMemoryContractRepository.create(contract);

    const base = makeBase({ baseName: "Itaberaba", contractId: contract.id });
    await inMemoryBaseRepository.create(base);

    const newUser1 = makeUser({
      name: "Bruno Carlos",
      baseId: base.id,
      contractId: contract.id,
    });
    const newUser2 = makeUser({
      name: "Bruno José",
      baseId: base.id,
      contractId: contract.id,
    });
    const newUser3 = makeUser({
      name: "Carlos",
      baseId: base.id,
      contractId: contract.id,
    });

    await inMemoryUserRepository.create(newUser1);
    await inMemoryUserRepository.create(newUser2);
    await inMemoryUserRepository.create(newUser3);

    const result = await sut.execute({
      page: 1,
      name: "bru",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight())
      expect(result.value.users).toEqual([
        expect.objectContaining({
          props: expect.objectContaining({ name: "Bruno Carlos" }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({ name: "Bruno José" }),
        }),
      ]);
  });
});
