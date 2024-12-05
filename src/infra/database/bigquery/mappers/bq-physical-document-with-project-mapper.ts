import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { PhysicalDocumentWithProject } from "src/domain/material-movimentation/enterprise/entities/value-objects/physical-document-with-project";
import { BqPhysicalDocumentProps } from "../schemas/physical-document";
import { Project } from "src/domain/material-movimentation/enterprise/entities/project";

export class BqPhysicalDocumentWithProjectMapper {
  static toDomain(raw: BqPhysicalDocumentProps): PhysicalDocumentWithProject {
    return PhysicalDocumentWithProject.create({
      physicalDocumentId: new UniqueEntityID(raw.id),
      baseId: new UniqueEntityID(raw.baseId),
      identifier: raw.identifier,
      unitized: raw.unitized,
      project: Project.create(
        {
          baseId: new UniqueEntityID(raw.project?.baseId),
          city: raw.project?.city ?? "",
          description: raw.project?.description ?? "",
          project_number: raw.project?.project_number ?? "",
          type: raw.project?.type ?? "",
        },
        new UniqueEntityID(raw.project?.id)
      ),
      projectKit:
        raw.projectKit === null
          ? undefined
          : Project.create({
              baseId: new UniqueEntityID(raw.projectKit?.baseId),
              city: raw.projectKit?.city ?? "",
              description: raw.projectKit?.description ?? "",
              project_number: raw.projectKit?.project_number ?? "",
              type: raw.projectKit?.type ?? "",
            }),
      projectMeter:
        raw.projectMeter === null
          ? undefined
          : Project.create({
              baseId: new UniqueEntityID(raw.projectMeter?.baseId),
              city: raw.projectMeter?.city ?? "",
              description: raw.projectMeter?.description ?? "",
              project_number: raw.projectMeter?.project_number ?? "",
              type: raw.projectMeter?.type ?? "",
            }),
    });
  }
}
