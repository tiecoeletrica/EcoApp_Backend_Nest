import { Injectable } from "@nestjs/common";
import { BigQueryMethods } from "bigquery/bigqueryMethods";
import { BqProjectProps } from "./project";

const tableId = "physical_document";

export interface BqPhysicalDocumentProps {
  id?: string;
  projectId: string;
  projectKitId?: string;
  projectMeterId?: string;
  identifier: number;
  unitized: boolean;
  baseId: string;

  project?: BqProjectProps;
  projectKit?: BqProjectProps;
  projectMeter?: BqProjectProps;
}

@Injectable()
export class PhysicalDocument extends BigQueryMethods<BqPhysicalDocumentProps> {
  constructor() {
    super(tableId);
  }
}
