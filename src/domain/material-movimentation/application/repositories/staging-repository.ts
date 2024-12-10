import {
  PaginationParams,
  PaginationParamsResponse,
} from "../../../../core/repositories/pagination-params";
import { Staging } from "../../enterprise/entities/staging";
import { StagingWithDetails } from "../../enterprise/entities/value-objects/staging-with-details";

export abstract class StagingRepository {
  abstract create(staging: Staging): Promise<void>;
  abstract findLastIdentifierByBaseId(baseId: string): Promise<number>;
  abstract findByIds(stagingIds: string[]): Promise<Staging[]>;
  abstract findManyWithDetails(
    params: PaginationParams,
    baseId: string,
    projectId?: string,
    supervisorIds?: string[],
    startDate?: Date,
    endDate?: Date,
    identifier?: string
  ): Promise<{
    stagings: StagingWithDetails[];
    pagination: PaginationParamsResponse;
  }>;
  abstract save(staging: Staging): Promise<void>;
  // abstract findByStagingName(stagingName: string): Promise<Staging | null>;
  // abstract findManyByContractId(contractId: string): Promise<Staging[]>;
  // abstract findById(stagingId: string): Promise<Staging | null>;
  // abstract findMany(params: PaginationParams): Promise<Staging[]>;
}
