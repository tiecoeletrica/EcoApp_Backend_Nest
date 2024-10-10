import { PhysicalDocument } from "src/domain/material-movimentation/enterprise/entities/physical-document";
import { BqPhysicalDocumentProps } from "../schemas/physical-document";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export class BqPhysicalDocumentMapper {
  static toDomain(raw: BqPhysicalDocumentProps): PhysicalDocument {
    return PhysicalDocument.create(
      {
        projectId: new UniqueEntityID(raw.projectId),
        identifier: raw.identifier,
        unitized: raw.unitized,
        baseId: new UniqueEntityID(raw.baseId),
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toBigquery(
    physicalDocument: PhysicalDocument
  ): BqPhysicalDocumentProps {
    return {
      id: physicalDocument.id.toString(),
      projectId: physicalDocument.projectId.toString(),
      identifier: physicalDocument.identifier,
      unitized: physicalDocument.unitized,
      baseId: physicalDocument.baseId.toString(),
    };
  }
}
