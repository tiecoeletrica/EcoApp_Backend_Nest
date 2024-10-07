import {
  PaginationParams,
  PaginationParamsResponse,
} from "../../../../core/repositories/pagination-params";
import { Material } from "../../enterprise/entities/material";

export abstract class MaterialRepository {
  abstract create(Material: Material): Promise<void>;
  abstract findByCode(
    code: number,
    contractId: string
  ): Promise<Material | null>;
  abstract findByCodeWithoutContract(code: number): Promise<Material | null>;
  abstract findByIds(materialIds: string[]): Promise<Material[]>;
  abstract findMany(
    params: PaginationParams,
    contractId: string,
    type?: string
  ): Promise<{ materials: Material[]; pagination: PaginationParamsResponse }>;
}
