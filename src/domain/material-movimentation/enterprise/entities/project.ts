import { Entity } from "../../../../core/entities/entity";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";

export interface ProjectProps {
  project_number: string;
  description?: string | null;
  type: string;
  baseId: UniqueEntityID;
  city: string;
  firstMovimentationRegister?: Date;
  lastMovimentationRegister?: Date;
  firstBudegtRegister?: Date;
  lastBudegtRegister?: Date;
}

export class Project extends Entity<ProjectProps> {
  get project_number() {
    return this.props.project_number;
  }

  get description() {
    return this.props.description;
  }

  get type() {
    return this.props.type;
  }

  get baseId() {
    return this.props.baseId;
  }

  get firstMovimentationRegister() {
    return this.props.firstMovimentationRegister;
  }

  get lastMovimentationRegister() {
    return this.props.lastMovimentationRegister;
  }

  get firstBudegtRegister() {
    return this.props.firstBudegtRegister;
  }

  get lastBudegtRegister() {
    return this.props.lastBudegtRegister;
  }

  set baseId(baseId: UniqueEntityID) {
    this.props.baseId = baseId;
  }

  set firstMovimentationRegister(firstMovimentationRegister: Date | undefined) {
    this.props.firstMovimentationRegister = firstMovimentationRegister;
  }

  set lastMovimentationRegister(lastMovimentationRegister: Date | undefined) {
    this.props.lastMovimentationRegister = lastMovimentationRegister;
  }

  set firstBudegtRegister(firstBudegtRegister: Date | undefined) {
    this.props.firstBudegtRegister = firstBudegtRegister;
  }

  set lastBudegtRegister(lastBudegtRegister: Date | undefined) {
    this.props.lastBudegtRegister = lastBudegtRegister;
  }

  set description(description: string | null | undefined) {
    this.props.description = description;
  }

  get city() {
    return this.props.city;
  }

  set city(city: string) {
    this.props.city = city;
  }

  static create(props: ProjectProps, id?: UniqueEntityID) {
    const project = new Project(props, id);

    return project;
  }
}
