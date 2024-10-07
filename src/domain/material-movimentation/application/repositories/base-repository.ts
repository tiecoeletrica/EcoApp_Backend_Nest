import {
  PaginationParams,
  PaginationParamsResponse,
} from "../../../../core/repositories/pagination-params";
import { Base } from "../../enterprise/entities/base";
import { BaseWithContract } from "../../enterprise/entities/value-objects/base-with-contract";

export abstract class BaseRepository {
  abstract create(Base: Base): Promise<void>;
  abstract findByBaseName(baseName: string): Promise<Base | null>;
  abstract findManyByContractId(contractId: string): Promise<Base[]>;
  abstract findById(baseId: string): Promise<Base | null>;
  abstract findByIds(baseIds: string[]): Promise<Base[]>;
  abstract findMany(params: PaginationParams): Promise<Base[]>;
  abstract findManyWithContract(
    params: PaginationParams
  ): Promise<{
    bases: BaseWithContract[];
    pagination: PaginationParamsResponse;
  }>;
}
