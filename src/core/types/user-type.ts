import { Administrator } from "src/domain/material-movimentation/enterprise/entities/administrator";
import { Estimator } from "src/domain/material-movimentation/enterprise/entities/estimator";
import { Storekeeper } from "src/domain/material-movimentation/enterprise/entities/storekeeper";
import { Supervisor } from "src/domain/material-movimentation/enterprise/entities/supervisor";

export type UserType =
  | "Administrador"
  | "Orçamentista"
  | "Almoxarife"
  | "Supervisor"
  | "Almoxarife Líder";

export type UserEntities = Storekeeper | Estimator | Supervisor | Administrator;
