import { MovimentationWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/movimentation-with-details";

export class MovimentationWithDetailsPresenter {
  static toHTTP(movimentation: MovimentationWithDetails) {
    return {
      id: movimentation.movimentationId.toString(),
      createdAt: movimentation.createdAt,
      observation: movimentation.observation,
      value: movimentation.value,
      base: {
        id: movimentation.base.id.toString(),
        baseName: movimentation.base.baseName,
      },
      user: {
        id: movimentation.storekeeper.id.toString(),
        name: movimentation.storekeeper.name,
        email: movimentation.storekeeper.email,
      },
      project: {
        id: movimentation.project.id.toString(),
        project_number: movimentation.project.project_number,
        description: movimentation.project.description,
        city: movimentation.project.city,
      },
      material: {
        id: movimentation.material.id.toString(),
        code: movimentation.material.code,
        description: movimentation.material.description,
        unit: movimentation.material.unit,
        type: movimentation.material.type,
      },
    };
  }
}
