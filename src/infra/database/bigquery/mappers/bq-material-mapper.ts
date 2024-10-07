import { Material } from "src/domain/material-movimentation/enterprise/entities/material";
import { BqMaterialProps } from "../schemas/materials";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export class BqMaterialMapper {
  static toDomain(raw: BqMaterialProps): Material {
    return Material.create(
      {
        code: raw.code,
        contractId: new UniqueEntityID(raw.contractId),
        description: raw.description,
        type: raw.type,
        unit: raw.unit,
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toBigquery(material: Material): BqMaterialProps {
    return {
      id: material.id.toString(),
      code: material.code,
      contractId: material.contractId.toString(),
      description: material.description,
      type: material.type,
      unit: material.unit,
    };
  }
}
