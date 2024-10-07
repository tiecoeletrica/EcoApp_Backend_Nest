import { Contract } from "src/domain/material-movimentation/enterprise/entities/contract";

export class ContractPresenter {
  static toHTTP(contract: Contract) {
    return {
      id: contract.id.toString(),
      contract: contract.contractName,
    };
  }
}
