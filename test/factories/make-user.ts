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
} from "src/domain/material-movimentation/enterprise/entities/administrator";
import { UserEntities } from "src/core/types/user-type";

type UserMakeProps =
  | StorekeeperProps
  | EstimatorProps
  | SupervisorProps
  | AdministratorProps;

export function makeUser(
  override: Partial<UserMakeProps> = {},
  id?: UniqueEntityID
): UserEntities {
  const entity = faker.helpers.arrayElement(userEntities);

  const baseProps = {
    name: faker.person.firstName(),
    cpf: cpfGenerator(),
    email: faker.internet.email({ provider: "ecoeletrica.com.br" }),
    status: faker.helpers.arrayElement(status),
    password: faker.internet.password(),
    baseId: new UniqueEntityID(),
    contractId: new UniqueEntityID(),
    firstLogin: false,
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

  async makeBqUser(data: Partial<UserMakeProps> = {}): Promise<UserEntities> {
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

function cpfGenerator(): string {
  const fakeNumber = faker.number.int({ min: 100000000, max: 999999999 });

  const firstDigit =
    (fakeNumber
      .toString()
      .split("")
      .map((item) => Number(item))
      .reduce((accumulator, currentValue, index) => {
        return accumulator + currentValue * (10 - index);
      }, 0) *
      10) %
    11;

  const secondDigit =
    (fakeNumber
      .toString()
      .concat(firstDigit.toString())
      .split("")
      .map((item) => Number(item))
      .reduce((accumulator, currentValue, index) => {
        return accumulator + currentValue * (11 - index);
      }, 0) *
      10) %
    11;

  if (
    fakeNumber
      .toString()
      .concat(firstDigit.toString(), secondDigit.toString())
      .split("").length > 11
  )
    return cpfGenerator();
  return fakeNumber
    .toString()
    .concat(firstDigit.toString(), secondDigit.toString());
}
