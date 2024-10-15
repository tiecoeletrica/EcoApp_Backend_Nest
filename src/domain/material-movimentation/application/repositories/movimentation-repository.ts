import {
  PaginationParams,
  PaginationParamsResponse,
} from "../../../../core/repositories/pagination-params";
import { Movimentation } from "../../enterprise/entities/movimentation";
import { MovimentationWithDetails } from "../../enterprise/entities/value-objects/movimentation-with-details";

export abstract class MovimentationRepository {
  abstract findByProject(
    projectid: string,
    materialId?: string
  ): Promise<Movimentation[]>;
  abstract findByProjectWithDetails(
    projectid: string,
    baseid: string,
    materialId?: string
  ): Promise<MovimentationWithDetails[]>;
  abstract findManyHistory(
    params: PaginationParams,
    baseId: string,
    storekeeperId?: string,
    projectId?: string,
    materialId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Movimentation[]>;
  abstract findManyHistoryWithDetails(
    params: PaginationParams,
    baseId: string,
    storekeeperId?: string,
    projectId?: string,
    materialId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    movimentations: MovimentationWithDetails[];
    pagination: PaginationParamsResponse;
  }>;
  abstract findManyAllHistoryWithDetails(
    baseId: string,
    storekeeperId?: string,
    projectId?: string,
    materialId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<MovimentationWithDetails[]>;
  abstract create(movimentations: Movimentation[]): Promise<void>;
}
