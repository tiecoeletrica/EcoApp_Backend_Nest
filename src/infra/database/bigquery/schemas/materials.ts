import { Injectable } from "@nestjs/common";
import { BigQueryMethods } from "bigquery/bigqueryMethods";

const tableId = "material";

export interface BqMaterialProps {
  id?: string;
  code: number;
  description: string;
  type: string;
  unit: string;
  contractId: string;
}

@Injectable()
export class Material extends BigQueryMethods<BqMaterialProps> {
  constructor() {
    super(tableId);
  }
}
