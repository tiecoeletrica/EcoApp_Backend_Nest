import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { ValueObject } from "src/core/entities/value-object";
import { Base } from "../base";

export interface StorekeeperWithBaseProps {
  storekeeperId: UniqueEntityID;
  name: string;
  email: string;
  cpf: string;
  type: string;
  base: Base;
  status: string;
  password: string;
}



export class StorekeeperWithBase extends ValueObject<StorekeeperWithBaseProps> {
  get base() {
    return this.props.base;
  }
  get storekeeperId() {
    return this.props.storekeeperId;
  }
  get email() {
    return this.props.email;
  }
  get type() {
    return this.props.type;
  }
  get status() {
    return this.props.status;
  }
  get password() {
    return this.props.password;
  }
  get name() {
    return this.props.name;
  }
  get cpf() {
    return this.props.cpf;
  }

  static create(props: StorekeeperWithBaseProps) {
    return new StorekeeperWithBase(props);
  }
}
