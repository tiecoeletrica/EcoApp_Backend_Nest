import { UserType } from "src/core/types/user-type";
import { Entity } from "../../../../core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface UserProps {
  name: string;
  email: string;
  cpf: string;
  status: string;
  type: UserType;
  password: string;
  baseId: UniqueEntityID;
  contractId: UniqueEntityID;
}

export class User<Props extends UserProps> extends Entity<Props> {
  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get cpf() {
    return this.props.cpf;
  }

  get status() {
    return this.props.status;
  }

  get type() {
    return this.props.type;
  }

  get password() {
    return this.props.password;
  }

  set status(status: string) {
    this.props.status = status;
  }

  set password(password: string) {
    this.props.password = password;
  }

  set type(type: UserType) {
    this.props.type = type;
  }

  get baseId() {
    return this.props.baseId;
  }

  set baseId(baseId: UniqueEntityID) {
    this.props.baseId = baseId;
  }

  get contractId() {
    return this.props.contractId;
  }

  set contractId(contractId: UniqueEntityID) {
    this.props.contractId = contractId;
  }
}
