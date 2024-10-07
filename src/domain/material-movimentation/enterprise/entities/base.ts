import { Entity } from "../../../../core/entities/entity";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";

export interface BaseProps {
  baseName: string;
  contractId: UniqueEntityID;
}

export class Base extends Entity<BaseProps> {
  get baseName() {
    return this.props.baseName;
  }

  get contractId() {
    return this.props.contractId;
  }

  set baseName(baseName: string) {
    this.props.baseName = baseName;
  }

  set contractId(contractId: UniqueEntityID) {
    this.props.contractId = contractId;
  }

  static create(props: BaseProps, id?: UniqueEntityID) {
    const base = new Base(props, id);

    return base;
  }
}
