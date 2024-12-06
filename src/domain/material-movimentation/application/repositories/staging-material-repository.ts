import { StagingMaterial } from "../../enterprise/entities/staging-material";

export abstract class StagingMaterialRepository {
  abstract create(StagingMaterials: StagingMaterial[]): Promise<void>;
}
