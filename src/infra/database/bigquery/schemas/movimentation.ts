import { Injectable } from "@nestjs/common";
import { BigQueryMethods } from "bigquery/bigqueryMethods";
import { BqBaseProps } from "./base";
import { BqUserProps } from "./user";
import { BqMaterialProps } from "./materials";
import { BqProjectProps } from "./project";

const tableId = "movimentation";

export interface BqMovimentationProps {
  id?: string;
  projectId: string;
  materialId: string;
  value: number;
  createdAt: Date;
  userId: string;
  observation: string;
  baseId: string;

  base?: BqBaseProps;
  user?: BqUserProps;
  material?: BqMaterialProps;
  project?: BqProjectProps;
}

@Injectable()
export class Movimentation extends BigQueryMethods<BqMovimentationProps> {
  constructor() {
    super(tableId);
  }
}
