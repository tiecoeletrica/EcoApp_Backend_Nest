import { PhysicalDocumentWithProject } from "src/domain/material-movimentation/enterprise/entities/value-objects/physical-document-with-project";

export class PhysicalDocumentWithProjectPresenter {
  static toHTTP(physicaldocument: PhysicalDocumentWithProject) {
    return {
      id: physicaldocument.physicalDocumentId.toString(),
      identifier: physicaldocument.identifier,
      unitized: physicaldocument.unitized,
      project: {
        id: physicaldocument.project.id.toString(),
        project_number: physicaldocument.project.project_number,
      },
      projectKit: {
        id: physicaldocument.projectKit?.id.toString(),
        project_number: physicaldocument.projectKit?.project_number,
      },
      projectMeter: {
        id: physicaldocument.projectMeter?.id.toString(),
        project_number: physicaldocument.projectMeter?.project_number,
      },
    };
  }
}
