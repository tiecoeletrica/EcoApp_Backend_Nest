import { beforeEach, describe, expect, it } from "vitest";
import { GetUserByIdUseCase } from "./get-user-by-id";
import { InMemoryUserRepository } from "../../../../../../test/repositories/in-memory-user-repository";
import { makeUser } from "../../../../../../test/factories/make-user";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeBase } from "test/factories/make-base";
import { makeContract } from "test/factories/make-contract";
import { Storekeeper } from "src/domain/material-movimentation/enterprise/entities/storekeeper";
import { Estimator } from "src/domain/material-movimentation/enterprise/entities/estimator";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let sut: GetUserByIdUseCase;

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
    sut = new GetUserByIdUseCase(inMemoryUserRepository);
  });

  it("should be able to get a user by ID - storekeeper", async () => {
    const base = makeBase();
    await inMemoryBaseRepository.create(base);

    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const user = makeUser({
      email: "rodrigo@ecoeletrica.com.br",
      baseId: base.id,
      contractId: contract.id,
      type: "Almoxarife",
    });

    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.user.userId).toEqual(user.id);
      expect(user).toBeInstanceOf(Storekeeper);
    }
  });

  it("should be able to get a user by ID - estimator", async () => {
    const base = makeBase();
    await inMemoryBaseRepository.create(base);

    const contract = makeContract();
    await inMemoryContractRepository.create(contract);

    const user = makeUser({
      email: "rodrigo@ecoeletrica.com.br",
      baseId: base.id,
      contractId: contract.id,
      type: "Orçamentista",
    });

    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.user.userId).toEqual(user.id);
      expect(user).toBeInstanceOf(Estimator);
    }
  });
});
