import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface StagingCancelReasonProps {
  stagingId: UniqueEntityID;
  storekeeperId: UniqueEntityID;
  reason: string;
  observation: string;
}

export class StagingCancelReason extends Entity<StagingCancelReasonProps> {
  get stagingId() {
    return this.props.stagingId;
  }

  set stagingId(stagingId: UniqueEntityID) {
    this.props.stagingId = stagingId;
  }

  get storekeeperId() {
    return this.props.storekeeperId;
  }

  set storekeeperId(storekeeperId: UniqueEntityID) {
    this.props.storekeeperId = storekeeperId;
  }

  get reason() {
    return this.props.reason;
  }

  set reason(reason: string) {
    this.props.reason = reason;
  }

  get observation() {
    return this.props.observation;
  }

  set observation(observation: string) {
    this.props.observation = observation;
  }

  static create(props: StagingCancelReasonProps, id?: UniqueEntityID) {
    const stagingcancelreason = new StagingCancelReason(props, id);

    return stagingcancelreason;
  }
}
