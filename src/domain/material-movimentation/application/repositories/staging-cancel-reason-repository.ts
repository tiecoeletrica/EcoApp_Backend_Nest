import { StagingCancelReason } from "../../enterprise/entities/staging-cancel-reason";

export abstract class StagingCancelReasonRepository {
  abstract create(StagingCancelReason: StagingCancelReason): Promise<void>;
}
