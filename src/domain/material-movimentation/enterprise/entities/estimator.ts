import { Optional } from "src/core/types/optional";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";
import { User, UserProps } from "./user";

export interface EstimatorProps extends UserProps {
  type: "Orçamentista";
}

export class Estimator extends User<EstimatorProps> {
  static create(
    props: Optional<EstimatorProps, "status" | "firstLogin">,
    id?: UniqueEntityID
  ) {
    const estimator = new Estimator(
      {
        ...props,
        status: props.status ?? "ativo",
        firstLogin: props.firstLogin ?? true,
      },
      id
    );

    return estimator;
  }
}
