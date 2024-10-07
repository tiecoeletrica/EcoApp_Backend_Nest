import { Module } from "@nestjs/common";
import { User } from "./schemas/user";
import { BigQueryService } from "./bigquery.service";
import { Material } from "./schemas/materials";
import { Base } from "./schemas/base";
import { Budget } from "./schemas/budget";
import { Contract } from "./schemas/contract";
import { Movimentation } from "./schemas/movimentation";
import { PhysicalDocument } from "./schemas/physical-document";
import { Project } from "./schemas/project";

@Module({
  providers: [
    Material,
    User,
    Base,
    Budget,
    Contract,
    Movimentation,
    PhysicalDocument,
    Project,
    BigQueryService,
  ],
  exports: [BigQueryService],
})
export class BigQueryModule {}
