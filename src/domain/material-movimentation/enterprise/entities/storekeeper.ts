import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";
import { Optional } from "../../../../core/types/optional";
import { User, UserProps } from "./user";

export interface StorekeeperProps extends UserProps {
  type: "Almoxarife" | "Administrador";
}

export class Storekeeper extends User<StorekeeperProps> {
  static create(
    props: Optional<StorekeeperProps, "status">,
    id?: UniqueEntityID
  ) {
    const storekeeper = new Storekeeper(
      {
        ...props,
        status: props.status ?? "ativo",
      },
      id
    );

    return storekeeper;
  }
}
