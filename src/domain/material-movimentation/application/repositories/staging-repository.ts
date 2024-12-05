import {
  PaginationParams,
  PaginationParamsResponse,
} from "../../../../core/repositories/pagination-params";
import { Staging } from "../../enterprise/entities/staging";

export abstract class StagingRepository {
  abstract create(Staging: Staging): Promise<void>;
  abstract findLastIdentifierByBaseId(baseId: string): Promise<number>;
  abstract findByIds(stagingIds: string[]): Promise<Staging[]>;
  // abstract findByStagingName(stagingName: string): Promise<Staging | null>;
  // abstract findManyByContractId(contractId: string): Promise<Staging[]>;
  // abstract findById(stagingId: string): Promise<Staging | null>;
  // abstract findMany(params: PaginationParams): Promise<Staging[]>;
  // abstract findManyWithContract(
  //   params: PaginationParams
  // ): Promise<{
  //   stagings: StagingWithContract[];
  //   pagination: PaginationParamsResponse;
  // }>;
}
