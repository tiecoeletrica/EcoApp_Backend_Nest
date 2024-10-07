import { Movimentation } from "src/domain/material-movimentation/enterprise/entities/movimentation";

export class MovimentationPresenter {
  static toHTTP(movimentation: Movimentation) {
    return {
      id: movimentation.id.toString(),
      baseId: movimentation.baseId.toString(),
      userId: movimentation.storekeeperId.toString(),
      projectId: movimentation.projectId.toString(),
      materialId: movimentation.materialId.toString(),
      createdAt: movimentation.createdAt,
      observation: movimentation.observation,
      value: movimentation.value,
    };
  }
}
