import { BaseWithContract } from "src/domain/material-movimentation/enterprise/entities/value-objects/base-with-contract";

export class BasePresenter {
  static toHTTP(baseWithContract: BaseWithContract) {
    return {
      id: baseWithContract.baseId.toString(),
      base: baseWithContract.baseName,
      contract: {
        contractName: baseWithContract.contract.contractName,
        id: baseWithContract.contract.id.toString(),
      },
    };
  }
}
