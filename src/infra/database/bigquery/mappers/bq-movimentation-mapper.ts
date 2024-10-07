import { Movimentation } from "src/domain/material-movimentation/enterprise/entities/movimentation";
import { BqMovimentationProps } from "../schemas/movimentation";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export class BqMovimentationMapper {
  static toDomain(raw: BqMovimentationProps): Movimentation {
    return Movimentation.create(
      {
        projectId: new UniqueEntityID(raw.projectId),
        materialId: new UniqueEntityID(raw.materialId),
        value: raw.value,
        createdAt: raw.createdAt,
        storekeeperId: new UniqueEntityID(raw.userId),
        observation: raw.observation,
        baseId: new UniqueEntityID(raw.baseId),
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toBigquery(movimentation: Movimentation): BqMovimentationProps {
    return {
      id: movimentation.id.toString(),
      projectId: movimentation.projectId.toString(),
      materialId: movimentation.materialId.toString(),
      value: movimentation.value,
      createdAt: movimentation.createdAt,
      userId: movimentation.storekeeperId.toString(),
      observation: movimentation.observation,
      baseId: movimentation.baseId.toString(),
    };
  }
}
