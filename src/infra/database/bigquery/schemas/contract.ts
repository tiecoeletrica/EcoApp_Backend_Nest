import { Injectable } from "@nestjs/common";
import { BigQueryMethods } from "bigquery/bigqueryMethods";

const tableId = "contract";

export interface BqContractProps {
  id?: string;
  contractName: string;
}

@Injectable()
export class Contract extends BigQueryMethods<BqContractProps> {
  constructor() {
    super(tableId);
  }
}
