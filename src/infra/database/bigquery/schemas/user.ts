import { Injectable } from "@nestjs/common";
import { BigQueryMethods } from "bigquery/bigqueryMethods";
import { BqBaseProps } from "./base";
import { BqContractProps } from "./contract";

const tableId = "user";

export interface BqUserProps {
  id?: string;
  name: string;
  email: string;
  password: string;
  cpf: string;
  type: string;
  status: string;
  baseId: string;
  contractId: string;

  // relacionamentos
  base?: BqBaseProps;
  contract?: BqContractProps;
}

@Injectable()
export class User extends BigQueryMethods<BqUserProps> {
  constructor() {
    super(tableId);
  }
}
