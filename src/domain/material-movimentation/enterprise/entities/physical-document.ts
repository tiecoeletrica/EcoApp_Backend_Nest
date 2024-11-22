import { Entity } from "../../../../core/entities/entity";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";
import { Optional } from "../../../../core/types/optional";

export interface PhysicalDocumentProps {
  projectId: UniqueEntityID;
  projectKitId?: UniqueEntityID;
  projectMeterId?: UniqueEntityID;
  identifier: number;
  unitized: boolean;
  baseId: UniqueEntityID;
}

export class PhysicalDocument extends Entity<PhysicalDocumentProps> {
  get projectId() {
    return this.props.projectId;
  }

  get projectKitId() {
    return this.props.projectKitId;
  }

  get projectMeterId() {
    return this.props.projectMeterId;
  }

  get identifier() {
    return this.props.identifier;
  }

  get unitized() {
    return this.props.unitized;
  }

  set projectId(projectId: UniqueEntityID) {
    this.props.projectId = projectId;
  }

  set projectKitId(projectKitId: UniqueEntityID | undefined) {
    this.props.projectKitId = projectKitId;
  }

  set projectMeterId(projectMeterId: UniqueEntityID | undefined) {
    this.props.projectMeterId = projectMeterId;
  }

  get baseId() {
    return this.props.baseId;
  }

  set baseId(baseId: UniqueEntityID) {
    this.props.baseId = baseId;
  }

  set identifier(identifier: number) {
    this.props.identifier = identifier;
  }

  set unitized(unitized: boolean) {
    this.props.unitized = unitized;
  }

  static create(
    props: Optional<PhysicalDocumentProps, "unitized">,
    id?: UniqueEntityID
  ) {
    const physicalDocument = new PhysicalDocument(
      {
        ...props,
        unitized: props.unitized ?? false,
      },
      id
    );

    return physicalDocument;
  }
}
