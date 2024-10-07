import { Injectable } from "@nestjs/common";
import { BigQueryMethods } from "bigquery/bigqueryMethods";
import { BqProjectProps } from "./project";

const tableId = "physical_document";

export interface BqPhysicalDocumentProps {
  id?: string;
  projectId: string;
  identifier: number;
  unitized: boolean;

  project?: BqProjectProps;
}

@Injectable()
export class PhysicalDocument extends BigQueryMethods<BqPhysicalDocumentProps> {
  constructor() {
    super(tableId);
  }
}
