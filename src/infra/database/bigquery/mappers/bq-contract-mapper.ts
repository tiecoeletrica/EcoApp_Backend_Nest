import { Contract } from "src/domain/material-movimentation/enterprise/entities/contract";
import { BqContractProps } from "../schemas/contract";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export class BqContractMapper {
  static toDomain(raw: BqContractProps): Contract {
    return Contract.create(
      {
        contractName: raw.contractName,
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toBigquery(contract: Contract): BqContractProps {
    return {
      id: contract.id.toString(),
      contractName: contract.contractName,
    };
  }
}
