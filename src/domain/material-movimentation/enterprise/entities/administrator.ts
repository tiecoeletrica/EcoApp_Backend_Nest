import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";
import { Optional } from "../../../../core/types/optional";
import { User, UserProps } from "./user";

export interface AdministratorProps extends UserProps {
  type: "Administrador";
}

export class Administrator extends User<AdministratorProps> {
  static create(
    props: Optional<AdministratorProps, "status" | "firstLogin">,
    id?: UniqueEntityID
  ) {
    const administrator = new Administrator(
      {
        ...props,
        status: props.status ?? "ativo",
        firstLogin: props.firstLogin ?? true,
      },
      id
    );

    return administrator;
  }
}
