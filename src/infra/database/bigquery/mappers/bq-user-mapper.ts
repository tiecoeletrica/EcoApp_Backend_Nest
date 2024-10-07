import { Storekeeper } from "src/domain/material-movimentation/enterprise/entities/storekeeper";
import { Estimator } from "src/domain/material-movimentation/enterprise/entities/estimator";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { BqUserProps } from "../schemas/user";
import { UserType } from "src/core/types/user-type";

export class BqUserMapper {
  static toDomain(raw: BqUserProps): Storekeeper | Estimator {
    if (raw.type === "Orçamentista") {
      return Estimator.create(
        {
          contractId: new UniqueEntityID(raw.contractId),
          baseId: new UniqueEntityID(raw.baseId),
          cpf: raw.cpf,
          email: raw.email,
          name: raw.name,
          password: raw.password,
          type: raw.type,
          status: raw.status,
        },
        new UniqueEntityID(raw.id)
      );
    } else {
      return Storekeeper.create(
        {
          contractId: new UniqueEntityID(raw.contractId),
          baseId: new UniqueEntityID(raw.baseId),
          cpf: raw.cpf,
          email: raw.email,
          name: raw.name,
          password: raw.password,
          type: BqUserMapper.isUserType(raw.type) ? raw.type : "Almoxarife",
          status: raw.status,
        },
        new UniqueEntityID(raw.id)
      );
    }
  }

  static toBigquery(
    storekeeperOrEstimator: Storekeeper | Estimator
  ): BqUserProps {
    if (storekeeperOrEstimator instanceof Storekeeper)
      return {
        id: storekeeperOrEstimator.id.toString(),
        cpf: storekeeperOrEstimator.cpf,
        email: storekeeperOrEstimator.email,
        name: storekeeperOrEstimator.name,
        password: storekeeperOrEstimator.password,
        status: storekeeperOrEstimator.status,
        type: storekeeperOrEstimator.type,
        baseId: storekeeperOrEstimator.baseId.toString(),
        contractId: storekeeperOrEstimator.contractId.toString(),
      };

    if (storekeeperOrEstimator instanceof Estimator) {
      return {
        id: storekeeperOrEstimator.id.toString(),
        cpf: storekeeperOrEstimator.cpf,
        email: storekeeperOrEstimator.email,
        name: storekeeperOrEstimator.name,
        password: storekeeperOrEstimator.password,
        status: storekeeperOrEstimator.status,
        type: storekeeperOrEstimator.type,
        contractId: storekeeperOrEstimator.contractId.toString(),
        baseId: storekeeperOrEstimator.baseId.toString(),
      };
    } else {
      throw new Error();
    }
  }

  static toBigqueryUser(user: Storekeeper | Estimator): BqUserProps {
    return {
      id: user.id.toString(),
      cpf: user.cpf,
      email: user.email,
      name: user.name,
      password: user.password,
      status: user.status,
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
    };
  }

  private static isUserType(
    type: string
  ): type is "Administrador" | "Almoxarife" {
    return ["Administrador", "Almoxarife"].includes(type as UserType);
  }
}
