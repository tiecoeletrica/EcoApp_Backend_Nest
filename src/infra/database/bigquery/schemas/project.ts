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
}

@Injectable()
export class Project extends BigQueryMethods<BqProjectProps> {
  constructor() {
    super(tableId);
  }
}
