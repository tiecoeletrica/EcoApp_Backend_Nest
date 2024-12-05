import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  MaterialPerProject,
  MaterialPerProjectProps,
} from "./material-per-project";
import { Optional } from "src/core/types/optional";

export interface StagingMaterialProps extends MaterialPerProjectProps {
  stagingId: UniqueEntityID;
}

export class StagingMaterial extends MaterialPerProject<StagingMaterialProps> {
  get stagingId() {
    return this.props.stagingId;
  }

  set stagingId(stagingId: UniqueEntityID) {
    this.props.stagingId = stagingId;
  }

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
