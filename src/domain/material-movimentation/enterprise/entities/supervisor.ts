import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";
import { Optional } from "../../../../core/types/optional";
import { User, UserProps } from "./user";

export interface SupervisorProps extends UserProps {
  type: "Supervisor";
}

export class Supervisor extends User<SupervisorProps> {
  static create(
    props: Optional<SupervisorProps, "status">,
    id?: UniqueEntityID
  ) {
    const supervisor = new Supervisor(
      {
        ...props,
        status: props.status ?? "ativo",
      },
      id
    );

    return supervisor;
  }
}
