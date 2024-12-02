import { Injectable } from "@nestjs/common";
import { BigQueryMethods } from "bigquery/bigqueryMethods";

const tableId = "project";

export interface BqProjectProps {
  id?: string;
  project_number: string;
  description?: string | null;
  type: string;
  baseId: string;
  city: string;
  firstMovimentationRegister?: Date;
  lastMovimentationRegister?: Date;
  firstBudgetRegister?: Date;
  lastBudgetRegister?: Date;
}

@Injectable()
export class Project extends BigQueryMethods<BqProjectProps> {
  constructor() {
    super(tableId);
  }
}
