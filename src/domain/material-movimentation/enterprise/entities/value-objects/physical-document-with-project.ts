import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { ValueObject } from "src/core/entities/value-object";
import { Project } from "../project";

export interface PhysicalDocumentWithProjectProps {
  physicalDocumentId: UniqueEntityID;
  identifier: number;
  unitized: boolean;
  project: Project;
  baseId: UniqueEntityID;
  projectKit?: Project;
  projectMeter?: Project;
}

export class PhysicalDocumentWithProject extends ValueObject<PhysicalDocumentWithProjectProps> {
  get physicalDocumentId() {
    return this.props.physicalDocumentId;
  }
  get baseId() {
    return this.props.baseId;
  }
  get identifier() {
    return this.props.identifier;
  }
  get unitized() {
    return this.props.unitized;
  }
  get project() {
    return this.props.project;
  }
  get projectKit() {
    return this.props.projectKit;
  }
  get projectMeter() {
    return this.props.projectMeter;
  }

  static create(props: PhysicalDocumentWithProjectProps) {
    return new PhysicalDocumentWithProject(props);
  }
}
