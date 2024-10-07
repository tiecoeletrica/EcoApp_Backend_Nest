import { Estimator } from "src/domain/material-movimentation/enterprise/entities/estimator";
import { Storekeeper } from "src/domain/material-movimentation/enterprise/entities/storekeeper";

export class UserPresenter {
  static toHTTP(user: Storekeeper | Estimator) {
    return {
      id: user.id.toString(),
      name: user.name,
      cpf: user.cpf,
      email: user.email,
      status: user.status,
      type: user.type,
      baseId: user instanceof Storekeeper ? user.baseId.toString() : undefined,
      contractId:
        user instanceof Estimator ? user.contractId.toString() : undefined,
    };
  }
}
