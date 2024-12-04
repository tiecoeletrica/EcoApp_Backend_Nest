import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface StagingTimestampProps {
  userId: UniqueEntityID;
  stagingId: UniqueEntityID;
  previousStage: string;
  nextStage: string;
  createdAt: Date;
  comment?: string;
}
