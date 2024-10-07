import { Material } from "src/domain/material-movimentation/enterprise/entities/material";

export class MaterialPresenter {
  static toHTTP(material: Material) {
    return {
      id: material.id.toString(),
      code: material.code,
      description: material.description,
      type: material.type,
      unit: material.unit,
    };
  }
}
