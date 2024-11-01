import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "../../src/core/entities/unique-entity-id";
import {
  Storekeeper,
  StorekeeperProps,
} from "../../src/domain/material-movimentation/enterprise/entities/storekeeper";
import {
  Estimator,
  EstimatorProps,
} from "../../src/domain/material-movimentation/enterprise/entities/estimator";
import { faker } from "@faker-js/faker";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { BqUserMapper } from "src/infra/database/bigquery/mappers/bq-user-mapper";
import {
  Supervisor,
  SupervisorProps,
} from "src/domain/material-movimentation/enterprise/entities/supervisor";
import {
  Administrator,
  AdministratorProps,
} from "src/domain/material-movimentation/enterprise/entities/Administrator";

type UserMakeProps =
  | StorekeeperProps
  | EstimatorProps
  | SupervisorProps
  | AdministratorProps;
type UserMake = Storekeeper | Estimator | Supervisor | Administrator;

export function makeUser(
  override: Partial<UserMakeProps> = {},
  id?: UniqueEntityID
): UserMake {
  const entity = faker.helpers.arrayElement(userEntities);

  const baseProps = {
    name: faker.person.firstName(),
    cpf: faker.number.int({ min: 100000000, max: 10000000000 }).toString(),
    email: faker.internet.email({ provider: "ecoeletrica.com.br" }),
    status: faker.helpers.arrayElement(status),
    password: faker.internet.password(),
    baseId: new UniqueEntityID(),
    contractId: new UniqueEntityID(),
  };

  if (
    (!override.type && entity === "Storekeeper") ||
    (override.type && storekeeperTypes.includes(override.type))
  ) {
    return Storekeeper.create(
      {
        ...baseProps,
        type: faker.helpers.arrayElement(storekeeperTypes) as
          | "Almoxarife"
          | "Almoxarife Líder",
        ...override,
      } as StorekeeperProps,
      id
    );
  } else if (override.type === "Supervisor") {
    return Supervisor.create(
      {
        ...baseProps,
        type: "Supervisor",
        ...override,
      } as SupervisorProps,
      id
    );
  } else if (override.type === "Administrador") {
    return Administrator.create(
      {
        ...baseProps,
        type: "Administrador",
        ...override,
      } as AdministratorProps,
      id
    );
  } else {
    return Estimator.create(
      {
        ...baseProps,
        type: "Orçamentista",
        ...override,
      } as EstimatorProps,
      id
    );
  }
}

@Injectable()
export class UserFactory {
  constructor(private bigquery: BigQueryService) {}

  async makeBqUser(data: Partial<UserMakeProps> = {}): Promise<UserMake> {
    const user = makeUser(data);

    await this.bigquery.user.create([BqUserMapper.toBigquery(user)]);

    return user;
  }
}

const status = ["ativo", "inativo"];
const storekeeperTypes = ["Almoxarife Líder", "Almoxarife"];
const userEntities = [
  "Storekeeper",
  "Estimator",
  "Supervisor",
  "Administrator",
];
