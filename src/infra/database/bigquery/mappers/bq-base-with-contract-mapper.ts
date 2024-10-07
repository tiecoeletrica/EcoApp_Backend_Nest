import { BqBaseProps } from "../schemas/base";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { BaseWithContract } from "src/domain/material-movimentation/enterprise/entities/value-objects/base-with-contract";

export class BqBaseWithContractMapper {
  static toDomain(raw: BqBaseProps): BaseWithContract {
    return BaseWithContract.create({
      baseName: raw.baseName,
      baseId: new UniqueEntityID(raw.id),
      contract: {id: new UniqueEntityID(raw.contract?.id), contractName: raw.contract?.contractName ?? ""},
    });
  }
}
