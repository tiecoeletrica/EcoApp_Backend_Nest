import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Optional } from "src/core/types/optional";
import { StageTypes } from "src/core/types/stage-type";

export interface StagingTimestampProps {
  storekeeperId: UniqueEntityID;
  stagingId: UniqueEntityID;
  currentStage: StageTypes;
  nextStage: StageTypes;
  createdAt: Date;
  comment?: string;
}

export class StagingTimestamp extends Entity<StagingTimestampProps> {
  get storekeeperId() {
    return this.props.storekeeperId;
  }

  set storekeeperId(storekeeperId: UniqueEntityID) {
    this.props.storekeeperId = storekeeperId;
  }

  get stagingId() {
    return this.props.stagingId;
  }

  set stagingId(stagingId: UniqueEntityID) {
    this.props.stagingId = stagingId;
  }

  get currentStage() {
    return this.props.currentStage;
  }

  set currentStage(currentStage: StageTypes) {
    this.props.currentStage = currentStage;
  }

  get nextStage() {
    return this.props.nextStage;
  }

  set nextStage(nextStage: StageTypes) {
    this.props.nextStage = nextStage;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  set createdAt(createdAt: Date) {
    this.props.createdAt = createdAt;
  }

  get comment() {
    return this.props.comment;
  }

  set comment(comment: string | undefined) {
    this.props.comment = comment;
  }

  static create(
    props: Optional<StagingTimestampProps, "createdAt">,
    id?: UniqueEntityID
  ) {
    const stagingTimestamp = new StagingTimestamp(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );

    return stagingTimestamp;
  }
}
