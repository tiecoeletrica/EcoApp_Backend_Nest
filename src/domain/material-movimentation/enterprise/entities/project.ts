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
  firstBudgetRegister?: Date;
  lastBudgetRegister?: Date;
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

  get firstBudgetRegister() {
    return this.props.firstBudgetRegister;
  }

  get lastBudgetRegister() {
    return this.props.lastBudgetRegister;
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

  set firstBudgetRegister(firstBudgetRegister: Date | undefined) {
    this.props.firstBudgetRegister = firstBudgetRegister;
  }

  set lastBudgetRegister(lastBudgetRegister: Date | undefined) {
    this.props.lastBudgetRegister = lastBudgetRegister;
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
