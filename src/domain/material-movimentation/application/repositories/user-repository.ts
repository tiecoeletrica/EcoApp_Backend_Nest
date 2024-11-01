import {
  PaginationParams,
  PaginationParamsResponse,
} from "src/core/repositories/pagination-params";
import { UserWithBaseContract } from "../../enterprise/entities/value-objects/user-with-base-contract";
import { UserEntities } from "src/core/types/user-type";

export abstract class UserRepository {
  abstract create(user: UserEntities): Promise<void>;
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
  abstract findByIds(userIds: string[]): Promise<Array<UserEntities>>;
  abstract save(user: UserEntities): Promise<void>;
  abstract findByEmail(email: string): Promise<UserEntities | null>;
  abstract findManyByName(name: string): Promise<UserEntities[]>;
  abstract delete(userId: string): Promise<void>;
}
