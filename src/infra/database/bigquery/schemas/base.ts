import { Injectable } from "@nestjs/common";
import { BigQueryMethods } from "bigquery/bigqueryMethods";
import { BqContractProps } from "./contract";

const tableId = "base";

export interface BqBaseProps {
  id?: string;
  baseName: string;
  contractId: string;

  // relacionamentos
  contract?: BqContractProps;
}

@Injectable()
export class Base extends BigQueryMethods<BqBaseProps> {
  constructor() {
    super(tableId);
  }
}
