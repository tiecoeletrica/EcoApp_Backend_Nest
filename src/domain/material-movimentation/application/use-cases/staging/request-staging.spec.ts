import { beforeEach, describe, expect, it } from "vitest";
import { RegisterStagingUseCase } from "./request-staging";
import { InMemoryStagingRepository } from "../../../../../../test/repositories/in-memory-staging-repository";
import { ResourceAlreadyRegisteredError } from "../../../../../core/errors/errors/resource-already-registered-error";
import { InMemoryBaseRepository } from "test/repositories/in-memory-base-repository";
import { InMemoryContractRepository } from "test/repositories/in-memory-contract-repository";
import { makeBase } from "test/factories/make-base";
import { makeStaging } from "test/factories/make-staging";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";

let inMemoryContractRepository: InMemoryContractRepository;
let inMemoryBaseRepository: InMemoryBaseRepository;
let inMemoryStagingRepository: InMemoryStagingRepository;
let sut: RegisterStagingUseCase;

describe("Create staging", () => {
  beforeEach(() => {
    inMemoryContractRepository = new InMemoryContractRepository();
    inMemoryBaseRepository = new InMemoryBaseRepository(
      inMemoryContractRepository
    );
    inMemoryStagingRepository = new InMemoryStagingRepository(
      inMemoryBaseRepository
    );
    sut = new RegisterStagingUseCase(
      inMemoryStagingRepository,
      inMemoryBaseRepository
    );
  });

  it("should be able to create a staging", async () => {
    const base = makeBase();
    await inMemoryBaseRepository.create(base);

    const result = await sut.execute({
      staging_number: "B-10101010",
      description: "fazenda-num-sei-das-quantas-POV-onde-judas-perdeu-as-botas",
      type: "obra",
      baseId: base.id.toString(),
      city: "Lagedo do Tabocal",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value?.staging.staging_number).toEqual("B-10101010");
      expect(result.value?.staging.type).toEqual("obra");
    }
    expect(inMemoryStagingRepository.items[0].id).toBeTruthy();
  });

  it("should not be able to create a staging if staging_number is already registered", async () => {
    const base = makeBase();
    await inMemoryBaseRepository.create(base);

    const staging = makeStaging({
      staging_number: "B-10101010",
      baseId: base.id,
    });
    await inMemoryStagingRepository.create(staging);

    const result = await sut.execute({
      staging_number: "B-10101010",
      description: "fazenda-num-sei-das-quantas-POV-onde-judas-perdeu-as-botas",
      type: "obra",
      baseId: base.id.toString(),
      city: "Lagedo do Tabocal",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceAlreadyRegisteredError);
  });

  it("should not be able to create a staging if baseId is not found", async () => {
    const result = await sut.execute({
      staging_number: "B-10101010",
      description: "fazenda-num-sei-das-quantas-POV-onde-judas-perdeu-as-botas",
      type: "obra",
      baseId: "base-id-that-doesnt-exist",
      city: "Lagedo do Tabocal",
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
