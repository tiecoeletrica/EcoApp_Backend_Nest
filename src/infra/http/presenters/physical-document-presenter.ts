import { PhysicalDocument } from "src/domain/material-movimentation/enterprise/entities/physical-document";

export class PhysicalDocumentPresenter {
  static toHTTP(physicaldocument: PhysicalDocument) {
    return {
      id: physicaldocument.id.toString(),
      identifier: physicaldocument.identifier,
      projectId: physicaldocument.projectId.toString(),
      projectKitId: physicaldocument.projectKitId?.toString(),
      projectMeterId: physicaldocument.projectMeterId?.toString(),
      unitized: physicaldocument.unitized,
    };
  }
}
