import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface StagingMaterialsProps {
  stagingId: UniqueEntityID;
  materialId: UniqueEntityID;
  value: number;
}
