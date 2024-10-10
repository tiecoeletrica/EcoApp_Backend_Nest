import {
  PaginationParams,
  PaginationParamsResponse,
} from "../../../../core/repositories/pagination-params";
import { PhysicalDocument } from "../../enterprise/entities/physical-document";
import { PhysicalDocumentWithProject } from "../../enterprise/entities/value-objects/physical-document-with-project";

export abstract class PhysicalDocumentRepository {
  abstract create(physicalDocument: PhysicalDocument): Promise<void>;
  abstract findByIdentifierOrProjectId(
    identifier: number,
    projectId: string,
    baseId: string
  ): Promise<PhysicalDocument[]>;
  abstract findByID(id: string): Promise<PhysicalDocument | null>;
  abstract save(physicalDocument: PhysicalDocument): Promise<void>;
  abstract findMany(
    params: PaginationParams,
    identifier?: number,
    projectId?: string
  ): Promise<PhysicalDocument[]>;
  abstract findManyWithProject(
    params: PaginationParams,
    baseId: string,
    identifier?: number,
    projectId?: string,
    unitized?: boolean
  ): Promise<{
    physicalDocuments: PhysicalDocumentWithProject[];
    pagination: PaginationParamsResponse;
  }>;
  abstract delete(physicalDocumentId: string): Promise<void>;
}
