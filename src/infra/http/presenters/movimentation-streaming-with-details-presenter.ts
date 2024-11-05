import { MovimentationWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/movimentation-with-details";

export class MovimentationStreamingWithDetailsPresenter {
  static toHTTP(movimentation: MovimentationWithDetails) {
    return {
      createdAt: movimentation.createdAt,
      observation: movimentation.observation,
      value: movimentation.value,
      base: {
        baseName: movimentation.base.baseName,
      },
      user: {
        name: movimentation.storekeeper.name,
      },
      project: {
        project_number: movimentation.project.project_number,
      },
      material: {
        code: movimentation.material.code,
        description: movimentation.material.description,
      },
    };
  }
}
