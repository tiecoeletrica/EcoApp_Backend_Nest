import { Base } from "src/domain/material-movimentation/enterprise/entities/base";
import { BqBaseProps } from "../schemas/base";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export class BqBaseMapper {
  static toDomain(raw: BqBaseProps): Base {
    return Base.create(
      {
        baseName: raw.baseName,
        contractId: new UniqueEntityID(raw.contractId),
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toBigquery(base: Base): BqBaseProps {
    return {
      id: base.id.toString(),
      baseName: base.baseName,
      contractId: base.contractId.toString(),
    };
  }
}
