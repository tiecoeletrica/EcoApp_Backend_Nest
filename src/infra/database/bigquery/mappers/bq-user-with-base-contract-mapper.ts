import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { BqUserProps } from "../schemas/user";
import { StorekeeperWithBase } from "src/domain/material-movimentation/enterprise/entities/value-objects/storekeeper-with-base";
import { BqBaseProps } from "../schemas/base";
import { Base } from "src/domain/material-movimentation/enterprise/entities/base";
import { EstimatorWithContract } from "src/domain/material-movimentation/enterprise/entities/value-objects/estimator-with-contract";
import { Contract } from "src/domain/material-movimentation/enterprise/entities/contract";
import { UserWithBaseContract } from "src/domain/material-movimentation/enterprise/entities/value-objects/user-with-base-contract";
import { SupervisorWithBase } from "src/domain/material-movimentation/enterprise/entities/value-objects/supervisor-with-base";

type BqUserWithBaseContract = BqUserProps & {
  base?: BqBaseProps;
};

export class BqUserWithBaseContractMapper {
  static toDomain(
    raw: BqUserWithBaseContract
  ): StorekeeperWithBase | EstimatorWithContract | SupervisorWithBase {
    if (raw.type === "Orçamentista") {
      return EstimatorWithContract.create({
        contract: Contract.create(
          { contractName: raw.contract?.contractName ?? "" },
          new UniqueEntityID(raw.contract?.id)
        ),
        estimatorId: new UniqueEntityID(raw.id),
        cpf: raw.cpf,
        email: raw.email,
        name: raw.name,
        password: raw.password,
        type: raw.type,
        status: raw.status,
      });
    } else {
      return StorekeeperWithBase.create({
        base: Base.create(
          {
            baseName: raw.base?.baseName ?? "",
            contractId: new UniqueEntityID(raw.base?.contractId),
          },
          new UniqueEntityID(raw.base?.id)
        ),
        cpf: raw.cpf,
        email: raw.email,
        name: raw.name,
        password: raw.password,
        type: raw.type,
        status: raw.status,
        storekeeperId: new UniqueEntityID(raw.id),
      });
    }
  }

  static toDomainUser(raw: BqUserProps): UserWithBaseContract {
    return UserWithBaseContract.create({
      base: Base.create(
        {
          baseName: raw.base?.baseName ?? "",
          contractId: new UniqueEntityID(raw.base?.contractId),
        },
        new UniqueEntityID(raw.base?.id)
      ),
      contract: Contract.create(
        { contractName: raw.contract?.contractName ?? "" },
        new UniqueEntityID(raw.contract?.id)
      ),
      cpf: raw.cpf,
      email: raw.email,
      name: raw.name,
      password: raw.password,
      type: raw.type,
      status: raw.status,
      userId: new UniqueEntityID(raw.id),
      firstLogin: raw.firstLogin,
    });
  }
}
