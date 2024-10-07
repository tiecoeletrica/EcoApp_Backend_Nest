import { Entity } from "../../../../core/entities/entity";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";

export interface MaterialPerProjectProps {
  projectId: UniqueEntityID;
  materialId: UniqueEntityID;
  value: number;
  createdAt: Date;
}

export abstract class MaterialPerProject<
  Props extends MaterialPerProjectProps
> extends Entity<Props> {
  get projectId() {
    return this.props.projectId;
  }

  set projectId(projectId: UniqueEntityID) {
    this.props.projectId = projectId;
  }

  set materialId(materialId: UniqueEntityID) {
    this.props.materialId = materialId;
  }

  set createdAt(createdAt: Date) {
    this.props.createdAt = createdAt;
  }

  set value(value: number) {
    this.props.value = value;
  }

  get materialId() {
    return this.props.materialId;
  }

  get value() {
    return this.props.value;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
