import {
  PaginationParams,
  PaginationParamsResponse,
} from "../../src/core/repositories/pagination-params";
import { MaterialRepository } from "../../src/domain/material-movimentation/application/repositories/material-repository";
import { Material } from "../../src/domain/material-movimentation/enterprise/entities/material";

export class InMemoryMaterialRepository implements MaterialRepository {
  public items: Material[] = [];

  async findByCode(code: number, contractId: string): Promise<Material | null> {
    const material = this.items.find(
      (item) => item.code === code && item.contractId.toString() === contractId
    );

    if (!material) return null;

    return material;
  }

  async findByCodeWithoutContract(code: number): Promise<Material | null> {
    const material = this.items.find((item) => item.code === code);

    if (!material) return null;

    return material;
  }

  async findByIds(ids: string[]): Promise<Material[]> {
    const material = this.items.filter((item) =>
      ids.includes(item.id.toString())
    );

    return material;
  }

  async create(material: Material) {
    this.items.push(material);
  }

  async findMany(
    { page }: PaginationParams,
    contractId: string,
    type?: string
  ): Promise<{ materials: Material[]; pagination: PaginationParamsResponse }> {
    const pageCount = 40;

    const materials = this.items
      .filter(
        (material) =>
          !contractId || material.contractId.toString() === contractId
      )
      .filter((material) => !type || material.type === type)
      .sort((a, b) => a.code - b.code)
      .slice((page - 1) * pageCount, page * pageCount);

    const total_count = this.items.length;

    const pagination: PaginationParamsResponse = {
      page,
      pageCount,
      lastPage: Math.ceil(total_count / pageCount),
    };

    return { materials, pagination };
  }
}
