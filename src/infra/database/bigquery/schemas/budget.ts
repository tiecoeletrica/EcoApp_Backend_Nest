import { Injectable } from "@nestjs/common";
import { BigQueryMethods } from "bigquery/bigqueryMethods";
import { BqContractProps } from "./contract";
import { BqUserProps } from "./user";
import { BqMaterialProps } from "./materials";
import { BqProjectProps } from "./project";

const tableId = "budget";

export interface BqBudgetProps {
  id?: string;
  userId: string;
  contractId: string;
  projectId: string;
  materialId: string;
  value: number;
  createdAt: Date;
  updatedAuthorId?: string;
  updatedAt?: Date;

  contract?: BqContractProps;
  user?: BqUserProps;
  material?: BqMaterialProps;
  project?: BqProjectProps;
  updatedAuthor?: BqUserProps;
}

@Injectable()
export class Budget extends BigQueryMethods<BqBudgetProps> {
  constructor() {
    super(tableId);
  }
}
