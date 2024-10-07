import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";
import { Optional } from "../../../../core/types/optional";
import {
  MaterialPerProject,
  MaterialPerProjectProps,
} from "./material-per-project";

export interface MovimentationProps extends MaterialPerProjectProps {
  storekeeperId: UniqueEntityID;
  observation: string;
  baseId: UniqueEntityID;
}

export class Movimentation extends MaterialPerProject<MovimentationProps> {
  get storekeeperId() {
    return this.props.storekeeperId;
  }

  set storekeeperId(storekeeperId: UniqueEntityID) {
    this.props.storekeeperId = storekeeperId;
  }

  get observation() {
    return this.props.observation;
  }

  get baseId() {
    return this.props.baseId;
  }

  set baseId(baseId: UniqueEntityID) {
    this.props.baseId = baseId;
  }

  static create(
    props: Optional<MovimentationProps, "createdAt">,
    id?: UniqueEntityID
  ) {
    const movimentation = new Movimentation(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );

    return movimentation;
  }
}
