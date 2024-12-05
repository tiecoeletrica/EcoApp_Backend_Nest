import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { MaterialPerProjectProps } from "./material-per-project";
import { Entity } from "src/core/entities/entity";
import { Optional } from "src/core/types/optional";

export type StagingMaterialProps = MaterialPerProjectProps;

export class StagingMaterial extends Entity<StagingMaterialProps> {
  static create(
    props: Optional<StagingMaterialProps, "createdAt">,
    id?: UniqueEntityID
  ) {
    const stagingMaterial = new StagingMaterial(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );

    return stagingMaterial;
  }
}
