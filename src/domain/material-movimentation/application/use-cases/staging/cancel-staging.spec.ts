import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStagingRepository } from "../../../../../../test/repositories/in-memory-staging-repository";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeStaging } from "test/factories/make-staging";
import { InMemoryProjectRepository } from "test/repositories/in-memory-project-repository";
import { InMemoryUserRepository } from "test/repositories/in-memory-user-repository";
import { makeUser } from "test/factories/make-user";
import { CancelStagingUseCase } from "./cancel-staging";
import { InMemoryStagingCancelReasonRepository } from "test/repositories/in-memory-staging-cancel-reason-repository";
import { NotValidError } from "src/core/errors/errors/not-valid-error";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryStagingRepository: InMemoryStagingRepository;
let inMemoryProjectRepository: InMemoryProjectRepository;
let inMemoryStagingCancelReasonRepository: InMemoryStagingCancelReasonRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let sut: CancelStagingUseCase;

describe("Cancel Staging", () => {
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
    inMemoryStagingCancelReasonRepository =
      new InMemoryStagingCancelReasonRepository();
    sut = new CancelStagingUseCase(
      inMemoryStagingCancelReasonRepository,
      inMemoryStagingRepository,
      inMemoryUserRepository
    );
  });

  it("should be able to cancel a staging stage for 'FERRAGEM' and 'CANCELADO'", async () => {
    const storekeeper = makeUser({ type: "Almoxarife Líder" });
    await inMemoryUserRepository.create(storekeeper);

    const staging = makeStaging({ type: "FERRAGEM" });
    await inMemoryStagingRepository.create(staging);

    const result = await sut.execute({
      stagingId: staging.id.toString(),
      storekeeperId: storekeeper.id.toString(),
      cancelStage: "CANCELADO",
      reason: "Não preciso mais",
      observation: "num sei das quantas",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryStagingRepository.items[0].stage).toEqual("CANCELADO");
      expect(inMemoryStagingCancelReasonRepository.items[0].reason).toEqual(
        "Não preciso mais"
      );
    }
  });

  it("should be able to cancel a staging stage for 'CONCRETO' and 'IMPROCEDENTE'", async () => {
    const storekeeper = makeUser({ type: "Almoxarife Líder" });
    await inMemoryUserRepository.create(storekeeper);

    const staging = makeStaging({ type: "CONCRETO" });
    await inMemoryStagingRepository.create(staging);

    const result = await sut.execute({
      stagingId: staging.id.toString(),
      storekeeperId: storekeeper.id.toString(),
      cancelStage: "IMPROCEDENTE",
      reason: "Não preciso mais",
      observation: "num sei das quantas",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryStagingRepository.items[0].stage).toEqual("IMPROCEDENTE");
      expect(inMemoryStagingCancelReasonRepository.items[0].reason).toEqual(
        "Não preciso mais"
      );
    }
  });

  it("should not be able to cancel a staging if new stage is not valid", async () => {
    const storekeeper = makeUser({ type: "Almoxarife Líder" });
    await inMemoryUserRepository.create(storekeeper);

    const staging = makeStaging({ type: "CONCRETO" });
    await inMemoryStagingRepository.create(staging);

    const result = await sut.execute({
      stagingId: staging.id.toString(),
      storekeeperId: storekeeper.id.toString(),
      cancelStage: "DESCONTINUAR",
      reason: "Não preciso mais",
      observation: "num sei das quantas",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotValidError);
      expect(result.value?.message).toContain("válido");
    }
  });

  it("should not be able to cancel a staging if new stage is not for canceling", async () => {
    const storekeeper = makeUser({ type: "Almoxarife Líder" });
    await inMemoryUserRepository.create(storekeeper);

    const staging = makeStaging({ type: "CONCRETO" });
    await inMemoryStagingRepository.create(staging);

    const result = await sut.execute({
      stagingId: staging.id.toString(),
      storekeeperId: storekeeper.id.toString(),
      cancelStage: "AGUARDANDO PROGRAMAÇÃO",
      reason: "Não preciso mais",
      observation: "num sei das quantas",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotValidError);
      expect(result.value?.message).toContain("cancelamento");
    }
  });

  it("should not be able to cancel a staging if staging is finished or canceled", async () => {
    const storekeeper = makeUser({ type: "Almoxarife Líder" });
    await inMemoryUserRepository.create(storekeeper);

    const staging = makeStaging({ type: "CONCRETO", stage: "OK" });
    await inMemoryStagingRepository.create(staging);

    const result = await sut.execute({
      stagingId: staging.id.toString(),
      storekeeperId: storekeeper.id.toString(),
      cancelStage: "CANCELADO",
      reason: "Não preciso mais",
      observation: "num sei das quantas",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotValidError);
      expect(result.value.message).toContain("alterado");
    }
  });
});
