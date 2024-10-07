import { Project } from "src/domain/material-movimentation/enterprise/entities/project";
import { BqProjectProps } from "../schemas/project";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export class BqProjectMapper {
  static toDomain(raw: BqProjectProps): Project {
    return Project.create(
      {
        baseId: new UniqueEntityID(raw.baseId),
        city: raw.city,
        description: raw.description,
        project_number: raw.project_number,
        type: raw.type,
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toBigquery(project: Project): BqProjectProps {
    return {
      id: project.id.toString(),
      baseId: project.baseId.toString(),
      city: project.city,
      description: project.description,
      type: project.type,
      project_number: project.project_number,
    };
  }
}
