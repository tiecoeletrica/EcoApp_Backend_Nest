import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";
import { Optional } from "../../../../core/types/optional";
import { User, UserProps } from "./user";

export interface StorekeeperProps extends UserProps {
  type: "Almoxarife" | "Almoxarife Líder";
}

export class Storekeeper extends User<StorekeeperProps> {
  static create(
    props: Optional<StorekeeperProps, "status" | "firstLogin">,
    id?: UniqueEntityID
  ) {
    const storekeeper = new Storekeeper(
      {
        ...props,
        status: props.status ?? "ativo",
        firstLogin: props.firstLogin ?? true,
      },
      id
    );

    return storekeeper;
  }
}
