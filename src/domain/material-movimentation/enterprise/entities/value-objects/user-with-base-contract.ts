import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { ValueObject } from "src/core/entities/value-object";
import { Base } from "../base";
import { Contract } from "../contract";

export interface UserWithBaseContractProps {
  userId: UniqueEntityID;
  name: string;
  email: string;
  cpf: string;
  type: string;
  base: Base;
  contract: Contract;
  status: string;
  password: string;
  firstLogin: boolean;
}

export class UserWithBaseContract extends ValueObject<UserWithBaseContractProps> {
  get base() {
    return this.props.base;
  }
  get contract() {
    return this.props.contract;
  }
  get userId() {
    return this.props.userId;
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
  get firstLogin() {
    return this.props.firstLogin;
  }

  static create(props: UserWithBaseContractProps) {
    return new UserWithBaseContract(props);
  }
}
