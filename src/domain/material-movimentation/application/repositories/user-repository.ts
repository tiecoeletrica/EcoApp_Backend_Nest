import {
  PaginationParams,
  PaginationParamsResponse,
} from "src/core/repositories/pagination-params";
import { Estimator } from "../../enterprise/entities/estimator";
import { Storekeeper } from "../../enterprise/entities/storekeeper";
import { UserWithBaseContract } from "../../enterprise/entities/value-objects/user-with-base-contract";

export abstract class UserRepository {
  abstract create(user: Storekeeper | Estimator): Promise<void>;
  abstract findByIdWithBaseContract(
    userId: string
  ): Promise<UserWithBaseContract | null>;
  abstract findManyWithBaseContract(
    params: PaginationParams,
    baseId?: string,
    contractId?: string,
    name?: string
  ): Promise<{
    users: UserWithBaseContract[];
    pagination: PaginationParamsResponse;
  }>;
  abstract findByIds(
    userIds: string[]
  ): Promise<Array<Storekeeper | Estimator>>;
  abstract save(user: Storekeeper | Estimator): Promise<void>;
  abstract findByEmail(email: string): Promise<Storekeeper | Estimator | null>;
  abstract delete(userId: string): Promise<void>;
}
