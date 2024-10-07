import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { ValueObject } from "src/core/entities/value-object";
import { Contract } from "../contract";

export interface EstimatorWithContractProps {
  estimatorId: UniqueEntityID;
  name: string;
  email: string;
  cpf: string;
  type: string;
  contract: Contract;
  status: string;
  password: string;
}



export class EstimatorWithContract extends ValueObject<EstimatorWithContractProps> {
  get contract() {
    return this.props.contract;
  }
  get estimatorId() {
    return this.props.estimatorId;
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

  static create(props: EstimatorWithContractProps) {
    return new EstimatorWithContract(props);
  }
}
