import { PhysicalDocumentWithProject } from "src/domain/material-movimentation/enterprise/entities/value-objects/physical-document-with-project";
import {
  PaginationParams,
  PaginationParamsResponse,
} from "../../src/core/repositories/pagination-params";
import { PhysicalDocumentRepository } from "../../src/domain/material-movimentation/application/repositories/physical-document-repository";
import { PhysicalDocument } from "../../src/domain/material-movimentation/enterprise/entities/physical-document";
import { InMemoryProjectRepository } from "./in-memory-project-repository";

export class InMemoryPhysicalDocumentRepository
  implements PhysicalDocumentRepository
{
  public items: PhysicalDocument[] = [];

  constructor(private projectRepository: InMemoryProjectRepository) {}

  async findByIdentifierProjectId(
    identifier: number,
    projectId: string
  ): Promise<PhysicalDocument[]> {
    const physicaldocument = this.items.filter(
      (item) =>
        item.identifier === identifier ||
        item.projectId.toString() === projectId
    );

    return physicaldocument;
  }

  async save(physicalDocument: PhysicalDocument) {
    const itemIndex = this.items.findIndex(
      (item) => item.id == physicalDocument.id
    );

    this.items[itemIndex] = physicalDocument;
  }

  async findByID(id: string): Promise<PhysicalDocument | null> {
    const physicalDocument = this.items.find(
      (item) => item.id.toString() === id
    );

    if (!physicalDocument) return null;

    return physicalDocument;
  }

  async create(physicaldocument: PhysicalDocument) {
    this.items.push(physicaldocument);
  }

  async findMany(
    { page }: PaginationParams,
    identifier?: number,
    projectId?: string
  ): Promise<PhysicalDocument[]> {
    const physicalDocuments = this.items
      .filter(
        (physicaldocument) =>
          !identifier || physicaldocument.identifier === identifier
      )
      .filter(
        (physicaldocument) =>
          !projectId || physicaldocument.projectId.toString() === projectId
      )
      .sort((a, b) => a.identifier - b.identifier)
      .slice((page - 1) * 40, page * 40);

    return physicalDocuments;
  }

  async findManyWithProject(
    { page }: PaginationParams,
    baseId,
    identifier?: number,
    projectId?: string
  ): Promise<{
    physicalDocuments: PhysicalDocumentWithProject[];
    pagination: PaginationParamsResponse;
  }> {
    const pageCount = 40;

    const physicalDocuments = this.items
      .filter(
        (physicaldocument) =>
          !identifier || physicaldocument.identifier === identifier
      )
      .filter(
        (physicaldocument) =>
          !projectId || physicaldocument.projectId.toString() === projectId
      )
      .filter((physicaldocument) => {
        const projects = this.projectRepository.items
          .filter((project) => project.baseId.toString() === baseId)
          .map((project) => project.id.toString());

        return projects.includes(physicaldocument.projectId.toString());
      })
      .map((physicalDocument) => {
        const project = this.projectRepository.items.find(
          (project) => project.id === physicalDocument.projectId
        );

        if (!project)
          throw new Error(
            `project ${physicalDocument.projectId} does not exist.`
          );

        return PhysicalDocumentWithProject.create({
          physicalDocumentId: physicalDocument.id,
          identifier: physicalDocument.identifier,
          unitized: physicalDocument.unitized,
          project,
        });
      })
      .sort((a, b) => a.identifier - b.identifier)
      .slice((page - 1) * pageCount, page * pageCount);

    const total_count = this.items.length;

    const pagination: PaginationParamsResponse = {
      page,
      pageCount,
      lastPage: Math.ceil(total_count / pageCount),
    };

    return { physicalDocuments, pagination };
  }

  async delete(physicalDocumentId: string) {
    const itemIndex = this.items.findIndex(
      (item) => item.id.toString() == physicalDocumentId
    );

    this.items.splice(itemIndex, 1);
  }
}
