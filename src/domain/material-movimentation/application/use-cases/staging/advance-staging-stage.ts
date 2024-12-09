import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { StagingRepository } from "../../repositories/staging-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { UserRepository } from "../../repositories/user-repository";
import { NotValidError } from "src/core/errors/errors/not-valid-error";
import { StagingTimestampRepository } from "../../repositories/staging-timestamp-repository";
import { StagingTimestamp } from "src/domain/material-movimentation/enterprise/entities/staging-timestamp";

interface AdvanceStagingStageUseCaseRequest {
  stagingId: string;
  storekeeperId: string;
  comment?: string;
}

type AdvanceStagingStageResponse = Eihter<
  NotValidError | ResourceNotFoundError,
  null
>;

@Injectable()
export class AdvanceStagingStageUseCase {
  constructor(
    private stagingTimestampRepository: StagingTimestampRepository,
    private stagingRepository: StagingRepository,
    private userRepository: UserRepository
  ) {}

  async execute({
    stagingId,
    storekeeperId,
    comment,
  }: AdvanceStagingStageUseCaseRequest): Promise<AdvanceStagingStageResponse> {
    const [user] = await this.userRepository.findByIds([storekeeperId]);
    if (!user) return left(new ResourceNotFoundError("userId não encontrado"));

    const [staging] = await this.stagingRepository.findByIds([stagingId]);
    if (!staging)
      return left(new ResourceNotFoundError("stagingId não encontrado"));

    const resultAdvance = staging.nextStage();

    if (resultAdvance.currentStage === resultAdvance.nextStage)
      return left(
        new NotValidError(
          `Não é possível avançar a separação '${staging.identifier}' que está no estágio '${staging.stage}'`
        )
      );

    const stagingTimestamp = StagingTimestamp.create({
      stagingId: new UniqueEntityID(stagingId),
      storekeeperId: new UniqueEntityID(storekeeperId),
      currentStage: resultAdvance.currentStage,
      nextStage: resultAdvance.nextStage,
      comment,
    });

    await this.stagingTimestampRepository.create(stagingTimestamp);

    return right(null);
  }
}
