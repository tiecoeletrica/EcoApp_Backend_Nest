import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { ValueObject } from "src/core/entities/value-object";
import { StageTypes } from "src/core/types/stage-type";
import { UserEntities } from "src/core/types/user-type";
import { Base } from "../base";
import { Project } from "../project";

export interface StagingWithDetailsProps {
  stagingId: UniqueEntityID;
  supervisor: UserEntities;
  base: Base;
  type: "FERRAGEM" | "CONCRETO";
  project: Project;
  lootDate: Date;
  observation?: string;
  origin: "ITENS PARCIAIS" | "ORÇAMENTO";
  transport?: "CARRETA" | "SAQUE";
  delivery?: "OBRA" | "REGIÃO";
  createdAt: Date;
  identifier: string;
  stage: StageTypes;
}

export class StagingWithDetails extends ValueObject<StagingWithDetailsProps> {
  get supervisor() {
    return this.props.supervisor;
  }

  get base() {
    return this.props.base;
  }

  get type() {
    return this.props.type;
  }

  get project() {
    return this.props.project;
  }

  get lootDate() {
    return this.props.lootDate;
  }

  get observation() {
    return this.props.observation;
  }

  get origin() {
    return this.props.origin;
  }

  get transport() {
    return this.props.transport;
  }

  get delivery() {
    return this.props.delivery;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get identifier() {
    return this.props.identifier;
  }

  get stage() {
    return this.props.stage;
  }

  static create(props: StagingWithDetailsProps) {
    return new StagingWithDetails(props);
  }
}
