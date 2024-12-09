import { StagingTimestamp } from "../../enterprise/entities/staging-timestamp";

export abstract class StagingTimestampRepository {
  abstract create(stagingTimestamps: StagingTimestamp): Promise<void>;
}
