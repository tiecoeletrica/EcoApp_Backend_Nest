import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { ValueObject } from "src/core/entities/value-object";
import { Material } from "../material";
import { Project } from "../project";
import { Estimator } from "../estimator";
import { Contract } from "../contract";
import { Storekeeper } from "../storekeeper";
import { Supervisor } from "../supervisor";
import { UserEntities } from "src/core/types/user-type";

export interface BudgetWithDetailsProps {
  budgetId: UniqueEntityID;
  value: number;
  createdAt: Date;
  estimator: UserEntities;
  material: Material;
  project: Project;
  contract: Contract;
  updatedAuthor?: UserEntities;
  updatedAt?: Date;
}

export class BudgetWithDetails extends ValueObject<BudgetWithDetailsProps> {
  get budgetId() {
    return this.props.budgetId;
  }
  get value() {
    return this.props.value;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get estimator() {
    return this.props.estimator;
  }
  get contract() {
    return this.props.contract;
  }
  get material() {
    return this.props.material;
  }
  get project() {
    return this.props.project;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get updatedAuthor() {
    return this.props.updatedAuthor;
  }

  static create(props: BudgetWithDetailsProps) {
    return new BudgetWithDetails(props);
  }
}
