import { Injectable } from "@nestjs/common";
import { User } from "./schemas/user";
import { Material } from "./schemas/materials";
import { Base } from "./schemas/base";
import { Budget } from "./schemas/budget";
import { Movimentation } from "./schemas/movimentation";
import { PhysicalDocument } from "./schemas/physical-document";
import { Project } from "./schemas/project";
import { Contract } from "./schemas/contract";

@Injectable()
export class BigQueryService {
  constructor(
    public readonly user: User,
    public readonly material: Material,
    public readonly base: Base,
    public readonly budget: Budget,
    public readonly movimentation: Movimentation,
    public readonly physicalDocument: PhysicalDocument,
    public readonly project: Project,
    public readonly contract: Contract
  ) {}
}
