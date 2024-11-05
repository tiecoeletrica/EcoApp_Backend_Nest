import { Storekeeper } from "src/domain/material-movimentation/enterprise/entities/storekeeper";
import { Estimator } from "src/domain/material-movimentation/enterprise/entities/estimator";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { BqUserProps } from "../schemas/user";
import { UserEntities, UserType } from "src/core/types/user-type";
import { Supervisor } from "src/domain/material-movimentation/enterprise/entities/supervisor";
import { Administrator } from "src/domain/material-movimentation/enterprise/entities/administrator";

export class BqUserMapper {
  static toDomain(raw: BqUserProps): UserEntities {
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
          firstLogin: raw.firstLogin,
        },
        new UniqueEntityID(raw.id)
      );
    } else if (raw.type === "Supervisor") {
      return Supervisor.create(
        {
          contractId: new UniqueEntityID(raw.contractId),
          baseId: new UniqueEntityID(raw.baseId),
          cpf: raw.cpf,
          email: raw.email,
          name: raw.name,
          password: raw.password,
          type: raw.type,
          status: raw.status,
          firstLogin: raw.firstLogin,
        },
        new UniqueEntityID(raw.id)
      );
    } else if (raw.type === "Administrador") {
      return Administrator.create(
        {
          contractId: new UniqueEntityID(raw.contractId),
          baseId: new UniqueEntityID(raw.baseId),
          cpf: raw.cpf,
          email: raw.email,
          name: raw.name,
          password: raw.password,
          type: raw.type,
          status: raw.status,
          firstLogin: raw.firstLogin,
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
          firstLogin: raw.firstLogin,
        },
        new UniqueEntityID(raw.id)
      );
    }
  }

  static toBigquery(storekeeperOrEstimator: UserEntities): BqUserProps {
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
      firstLogin: storekeeperOrEstimator.firstLogin,
    };
  }

  static toBigqueryUser(user: UserEntities): BqUserProps {
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
      firstLogin: user.firstLogin,
    };
  }

  private static isUserType(
    type: string
  ): type is "Almoxarife Líder" | "Almoxarife" {
    return ["Almoxarife Líder", "Almoxarife"].includes(type as UserType);
  }
}
