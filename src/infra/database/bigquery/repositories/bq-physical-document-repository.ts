import { Injectable } from "@nestjs/common";
import {
  PaginationParams,
  PaginationParamsResponse,
} from "src/core/repositories/pagination-params";
import { PhysicalDocumentRepository } from "src/domain/material-movimentation/application/repositories/physical-document-repository";
import { PhysicalDocument } from "src/domain/material-movimentation/enterprise/entities/physical-document";
import { BigQueryService } from "../bigquery.service";
import { BqPhysicalDocumentMapper } from "../mappers/bq-physical-document-mapper";
import { PhysicalDocumentWithProject } from "src/domain/material-movimentation/enterprise/entities/value-objects/physical-document-with-project";
import { BqPhysicalDocumentWithProjectMapper } from "../mappers/bq-physical-document-with-project-mapper";

@Injectable()
export class BqPhysicalDocumentRepository
  implements PhysicalDocumentRepository
{
  constructor(private bigquery: BigQueryService) {}

  async create(physicalDocument: PhysicalDocument): Promise<void> {
    const data = BqPhysicalDocumentMapper.toBigquery(physicalDocument);

    await this.bigquery.physicalDocument.create([data]);
  }

  async findByIdentifierOrProjectId(
    identifier: number,
    projectId: string,
    baseId: string
  ): Promise<PhysicalDocument[]> {
    const physicalDocuments = await this.bigquery.physicalDocument.select({
      where: { OR: [{ identifier }, { projectId }], AND: { baseId } },
    });

    return physicalDocuments.map(BqPhysicalDocumentMapper.toDomain);
  }

  async findByID(id: string): Promise<PhysicalDocument | null> {
    const [physicalDocument] = await this.bigquery.physicalDocument.select({
      where: { id },
    });

    if (!physicalDocument) return null;

    return BqPhysicalDocumentMapper.toDomain(physicalDocument);
  }

  async save(physicalDocument: PhysicalDocument): Promise<void> {
    await this.bigquery.physicalDocument.update({
      data: BqPhysicalDocumentMapper.toBigquery(physicalDocument),
      where: { id: BqPhysicalDocumentMapper.toBigquery(physicalDocument).id },
    });
  }

  async findMany(
    { page }: PaginationParams,
    identifier?: number,
    projectId?: string
  ): Promise<PhysicalDocument[]> {
    const pageCount = 40;

    const physicalDocuments = await this.bigquery.physicalDocument.select({
      where: { projectId, identifier },
      limit: pageCount,
      offset: pageCount * (page - 1),
      orderBy: { column: "identifier", direction: "ASC" },
    });

    return physicalDocuments.map(BqPhysicalDocumentMapper.toDomain);
  }

  async findManyWithProject(
    { page }: PaginationParams,
    baseId: string,
    identifier?: number,
    projectId?: string,
    unitized?: boolean
  ): Promise<{
    physicalDocuments: PhysicalDocumentWithProject[];
    pagination: PaginationParamsResponse;
  }> {
    const pageCount = 40;

    const { results: physicalDocuments, total_count } =
      await this.bigquery.physicalDocument.select({
        where: { projectId, identifier, unitized, baseId },
        limit: pageCount,
        offset: pageCount * (page - 1),
        count_results: true,
        orderBy: { column: "identifier", direction: "ASC" },
        include: {
          project: {
            join: {
              table: "project",
              on: "physical_document.projectId = project.id",
            },
            relationType: "one-to-one",
          },
        },
      });

    const pagination: PaginationParamsResponse = {
      page,
      pageCount,
      lastPage: Math.ceil(total_count / pageCount),
    };

    return {
      physicalDocuments: physicalDocuments.map(
        BqPhysicalDocumentWithProjectMapper.toDomain
      ),
      pagination,
    };
  }

  async delete(physicalDocumentId: string): Promise<void> {
    await this.bigquery.physicalDocument.delete({ id: physicalDocumentId });
  }
}
