import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { ValueObject } from "src/core/entities/value-object";
import { Base } from "../base";

export interface SupervisorWithBaseProps {
  supervisorId: UniqueEntityID;
  name: string;
  email: string;
  cpf: string;
  type: string;
  base: Base;
  status: string;
  password: string;
}

export class SupervisorWithBase extends ValueObject<SupervisorWithBaseProps> {
  get base() {
    return this.props.base;
  }
  get supervisorId() {
    return this.props.supervisorId;
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

  static create(props: SupervisorWithBaseProps) {
    return new SupervisorWithBase(props);
  }
}
