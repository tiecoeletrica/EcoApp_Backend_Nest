import {
  PaginationParams,
  PaginationParamsResponse,
} from "../../../../core/repositories/pagination-params";
import { Contract } from "../../enterprise/entities/contract";

export abstract class ContractRepository {
  abstract create(Contract: Contract): Promise<void>;
  abstract findByContractName(contractName: string): Promise<Contract | null>;
  abstract findById(contractId: string): Promise<Contract | null>;
  abstract findByIds(contractIds: string[]): Promise<Contract[]>;
  abstract findMany(
    params: PaginationParams
  ): Promise<{ contracts: Contract[]; pagination: PaginationParamsResponse }>;
}
