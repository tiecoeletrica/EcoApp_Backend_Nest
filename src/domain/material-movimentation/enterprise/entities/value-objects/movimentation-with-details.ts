import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { ValueObject } from "src/core/entities/value-object";
import { Material } from "../material";
import { Project } from "../project";
import { Base } from "../base";
import { UserEntities } from "src/core/types/user-type";

export interface MovimentationWithDetailsProps {
  movimentationId: UniqueEntityID;
  value: number;
  createdAt: Date;
  observation: string;
  storekeeper: UserEntities;
  material: Material;
  project: Project;
  base: Base;
}

export class MovimentationWithDetails extends ValueObject<MovimentationWithDetailsProps> {
  get movimentationId() {
    return this.props.movimentationId;
  }
  get value() {
    return this.props.value;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get observation() {
    return this.props.observation;
  }
  get storekeeper() {
    return this.props.storekeeper;
  }
  get material() {
    return this.props.material;
  }
  get project() {
    return this.props.project;
  }
  get base() {
    return this.props.base;
  }

  static create(props: MovimentationWithDetailsProps) {
    return new MovimentationWithDetails(props);
  }
}
