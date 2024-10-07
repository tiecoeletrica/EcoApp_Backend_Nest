import { Injectable } from "@nestjs/common";
import {
  PaginationParams,
  PaginationParamsResponse,
} from "src/core/repositories/pagination-params";
import { MaterialRepository } from "src/domain/material-movimentation/application/repositories/material-repository";
import { Material } from "src/domain/material-movimentation/enterprise/entities/material";
import { BigQueryService } from "../bigquery.service";
import { BqMaterialMapper } from "../mappers/bq-material-mapper";

@Injectable()
export class BqMaterialRepository implements MaterialRepository {
  constructor(private bigquery: BigQueryService) {}

  async create(material: Material): Promise<void> {
    const data = BqMaterialMapper.toBigquery(material);

    await this.bigquery.material.create([data]);
  }

  async findByCode(code: number, contractId: string): Promise<Material | null> {
    const [material] = await this.bigquery.material.select({
      where: { code, contractId },
    });

    if (!material) return null;

    return BqMaterialMapper.toDomain(material);
  }

  async findByCodeWithoutContract(code: number): Promise<Material | null> {
    const [material] = await this.bigquery.material.select({
      where: { code },
    });

    if (!material) return null;

    return BqMaterialMapper.toDomain(material);
  }

  async findByIds(ids: string[]): Promise<Material[]> {
    const materials = await this.bigquery.material.select({
      whereIn: { id: ids },
    });

    return materials.map(BqMaterialMapper.toDomain);
  }

  async findMany(
    { page }: PaginationParams,
    contractId: string,
    type?: string
  ): Promise<{ materials: Material[]; pagination: PaginationParamsResponse }> {
    const pageCount = 40;

    const objectSearch =
      type === undefined ? { contractId } : { contractId, type };

    const { results: materials, total_count } =
      await this.bigquery.material.select({
        where: objectSearch,
        limit: pageCount,
        offset: pageCount * (page - 1),
        count_results: true,
        orderBy: { column: "code", direction: "ASC" },
      });

    const pagination: PaginationParamsResponse = {
      page,
      pageCount,
      lastPage: Math.ceil(total_count / pageCount),
    };

    return { materials: materials.map(BqMaterialMapper.toDomain), pagination };
  }
}
