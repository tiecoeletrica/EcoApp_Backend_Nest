import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStagingRepository } from "../../../../../../test/repositories/in-memory-staging-repository";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeStaging } from "test/factories/make-staging";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { InMemoryUserRepository } from "test/repositories/in-memory-user-repository";
import { InMemoryStagingTimestampRepository } from "test/repositories/in-memory-staging-timestamp-repository";
import { makeUser } from "test/factories/make-user";
import { NotValidError } from "src/core/errors/errors/not-valid-error";
import { RewindStagingStageUseCase } from "./rewind-staging-stage";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryStagingRepository: InMemoryStagingRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryStagingTimestampRepository: InMemoryStagingTimestampRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let sut: RewindStagingStageUseCase;

describe("Rewind Staging Stage", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryUserRepository = new InMemoryUserRepository(
      inMemoryBaseRepository,
      inMemoryContractRepository
    );
    inMemoryProjectRepository = new InMemoryProjectRepository(
      inMemoryBaseRepository
    );
    inMemoryStagingRepository = new InMemoryStagingRepository(
      inMemoryUserRepository,
      inMemoryProjectRepository,
      inMemoryBaseRepository
    );
    inMemoryStagingTimestampRepository =
      new InMemoryStagingTimestampRepository();
    sut = new RewindStagingStageUseCase(
      inMemoryStagingTimestampRepository,
      inMemoryStagingRepository,
      inMemoryUserRepository
    );
  });

  it("should be able to rewind a staging stage for 'FERRAGEM'", async () => {
    const storekeeper = makeUser({ type: "Almoxarife Líder" });
    await inMemoryUserRepository.create(storekeeper);

    const staging = makeStaging({ type: "FERRAGEM", stage: "EM SEPARAÇÃO" });
    await inMemoryStagingRepository.create(staging);

    const result = await sut.execute({
      stagingId: staging.id.toString(),
      storekeeperId: storekeeper.id.toString(),
      comment: "num sei das quantas",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryStagingRepository.items[0].stage).toEqual(
        "AGUARDANDO SEPARAÇÃO"
      );
      expect(inMemoryStagingTimestampRepository.items[0].currentStage).toEqual(
        "EM SEPARAÇÃO"
      );
      expect(inMemoryStagingTimestampRepository.items[0].nextStage).toEqual(
        "AGUARDANDO SEPARAÇÃO"
      );
    }
  });

  it("should not be able to rewind a staging stage for 'CONCRETO' and 'SAQUE'", async () => {
    const storekeeper = makeUser({ type: "Almoxarife Líder" });
    await inMemoryUserRepository.create(storekeeper);

    const staging = makeStaging({
      type: "CONCRETO",
      transport: "SAQUE",
      stage: "OK",
    });
    await inMemoryStagingRepository.create(staging);

    const result = await sut.execute({
      stagingId: staging.id.toString(),
      storekeeperId: storekeeper.id.toString(),
      comment: "num sei das quantas",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotValidError);
  });

  it("should be able to rewind a staging stage for 'CONCRETO' and 'CARRETA'", async () => {
    const storekeeper = makeUser({ type: "Almoxarife Líder" });
    await inMemoryUserRepository.create(storekeeper);

    const staging = makeStaging({
      type: "CONCRETO",
      transport: "CARRETA",
      stage: "PROGRAMADO",
    });
    await inMemoryStagingRepository.create(staging);

    const result = await sut.execute({
      stagingId: staging.id.toString(),
      storekeeperId: storekeeper.id.toString(),
      comment: "num sei das quantas",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryStagingRepository.items[0].stage).toEqual(
        "AGUARDANDO PROGRAMAÇÃO"
      );
      expect(inMemoryStagingTimestampRepository.items[0].currentStage).toEqual(
        "PROGRAMADO"
      );
      expect(inMemoryStagingTimestampRepository.items[0].nextStage).toEqual(
        "AGUARDANDO PROGRAMAÇÃO"
      );
    }
  });

  it("should not be able to rewind a staging stage that is 'OK', 'CANCELADO' or 'IMPROCEDENTE' ", async () => {
    const storekeeper = makeUser({ type: "Almoxarife Líder" });
    await inMemoryUserRepository.create(storekeeper);

    const staging = makeStaging({ type: "FERRAGEM", stage: "CANCELADO" });
    await inMemoryStagingRepository.create(staging);

    const result = await sut.execute({
      stagingId: staging.id.toString(),
      storekeeperId: storekeeper.id.toString(),
      comment: "num sei das quantas",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotValidError);
  });
});
