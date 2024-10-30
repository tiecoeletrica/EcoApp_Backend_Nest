import {
  PaginationParams,
  PaginationParamsResponse,
} from "src/core/repositories/pagination-params";
import { Estimator } from "../../enterprise/entities/estimator";
import { Storekeeper } from "../../enterprise/entities/storekeeper";
import { UserWithBaseContract } from "../../enterprise/entities/value-objects/user-with-base-contract";
import { Supervisor } from "../../enterprise/entities/supervisor";

export abstract class UserRepository {
  abstract create(user: Storekeeper | Estimator | Supervisor): Promise<void>;
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
  ): Promise<Array<Storekeeper | Estimator | Supervisor>>;
  abstract save(user: Storekeeper | Estimator | Supervisor): Promise<void>;
  abstract findByEmail(
    email: string
  ): Promise<Storekeeper | Estimator | Supervisor | null>;
  abstract findByName(
    name: string
  ): Promise<Storekeeper | Estimator | Supervisor | null>;
  abstract delete(userId: string): Promise<void>;
}
