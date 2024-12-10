import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { StagingRepository } from "../../repositories/staging-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { UserRepository } from "../../repositories/user-repository";
import { NotValidError } from "src/core/errors/errors/not-valid-error";
import { StagingCancelReasonRepository } from "../../repositories/staging-cancel-reason-repository";
import { StagingCancelReason } from "src/domain/material-movimentation/enterprise/entities/staging-cancel-reason";

interface CancelStagingUseCaseRequest {
  stagingId: string;
  storekeeperId: string;
  cancelStage: string;
  reason: string;
  observation: string;
}

type CancelStagingResponse = Eihter<
  NotValidError | ResourceNotFoundError,
  null
>;

@Injectable()
export class CancelStagingUseCase {
  constructor(
    private stagingCancelReasonRepository: StagingCancelReasonRepository,
    private stagingRepository: StagingRepository,
    private userRepository: UserRepository
  ) {}

  async execute({
    stagingId,
    storekeeperId,
    cancelStage,
    reason,
    observation,
  }: CancelStagingUseCaseRequest): Promise<CancelStagingResponse> {
    const [user] = await this.userRepository.findByIds([storekeeperId]);
    if (!user) return left(new ResourceNotFoundError("Usuário não encontrado"));

    const [staging] = await this.stagingRepository.findByIds([stagingId]);
    if (!staging)
      return left(new ResourceNotFoundError("Separação não encontrada"));

    const resultCancel = staging.cancel(cancelStage);
    if (!resultCancel.result)
      return left(new NotValidError(resultCancel.message));

    const stagingCancelReason = StagingCancelReason.create({
      stagingId: staging.id,
      storekeeperId: user.id,
      reason,
      observation,
    });

    await this.stagingCancelReasonRepository.create(stagingCancelReason);
    await this.stagingRepository.save(staging);

    return right(null);
  }
}
