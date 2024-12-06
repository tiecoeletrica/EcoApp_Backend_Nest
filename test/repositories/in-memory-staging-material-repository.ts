import { StagingMaterialRepository } from "src/domain/material-movimentation/application/repositories/staging-material-repository";
import { StagingMaterial } from "src/domain/material-movimentation/enterprise/entities/staging-material";

export class InMemoryStagingMaterialRepository
  implements StagingMaterialRepository
{
  public items: StagingMaterial[] = [];

  constructor() {}

  async create(stagingMaterials: StagingMaterial[]) {
    stagingMaterials.map((stagingMaterials) =>
      this.items.push(stagingMaterials)
    );
  }
}
