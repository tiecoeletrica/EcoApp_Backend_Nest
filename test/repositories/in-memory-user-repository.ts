import { UserRepository } from "src/domain/material-movimentation/application/repositories/user-repository";
import { Estimator } from "src/domain/material-movimentation/enterprise/entities/estimator";
import { Storekeeper } from "src/domain/material-movimentation/enterprise/entities/storekeeper";
import { InMemoryBaseRepository } from "./in-memory-base-repository";
import { InMemoryContractRepository } from "./in-memory-contract-repository";
import { UserWithBaseContract } from "src/domain/material-movimentation/enterprise/entities/value-objects/user-with-base-contract";
import {
  PaginationParams,
  PaginationParamsResponse,
} from "src/core/repositories/pagination-params";

export class InMemoryUserRepository implements UserRepository {
  public items: Array<Estimator | Storekeeper> = [];

  constructor(
    private baseRepository: InMemoryBaseRepository,
    private contractRepository: InMemoryContractRepository
  ) {}

  async create(user: Storekeeper | Estimator) {
    this.items.push(user);
  }

  async findByIdWithBaseContract(
    id: string
  ): Promise<UserWithBaseContract | null> {
    const user = this.items.find((item) => item.id.toString() === id);
    if (!user) return null;

    const base = this.baseRepository.items.find(
      (base) => base.id === user.baseId
    );

    const contract = this.contractRepository.items.find(
      (contract) => contract.id === user.contractId
    );

    if (!base) {
      throw new Error(`base ${user.baseId} does not exist.`);
    }

    if (!contract) {
      throw new Error(`contract ${user.contractId} does not exist.`);
    }

    return UserWithBaseContract.create({
      userId: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      type: user.type,
      base,
      contract,
      status: user.status,
      password: user.password,
    });
  }

  async findManyWithBaseContract(
    { page }: PaginationParams,
    baseId?: string,
    contractId?: string,
    name?: string
  ): Promise<{
    users: UserWithBaseContract[];
    pagination: PaginationParamsResponse;
  }> {
    const pageCount = 40;

    const users = this.items
      .filter((user) => !baseId || user.baseId.toString() === baseId)
      .filter(
        (user) => !contractId || user.contractId.toString() === contractId
      )
      .filter((user) => !name || user.name.includes(name))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice((page - 1) * pageCount, page * pageCount)
      .map((user) => {
        const base = this.baseRepository.items.find(
          (base) => base.id === user.baseId
        );

        if (!base) {
          throw new Error(`base ${user.baseId} does not exist.`);
        }

        const contract = this.contractRepository.items.find(
          (contract) => contract.id === user.contractId
        );

        if (!contract) {
          throw new Error(`contract ${user.contractId} does not exist.`);
        }

        return UserWithBaseContract.create({
          userId: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          type: user.type,
          base,
          contract,
          status: user.status,
          password: user.password,
        });
      });

    const total_count = this.items.length;

    const pagination: PaginationParamsResponse = {
      page,
      pageCount,
      lastPage: Math.ceil(total_count / pageCount),
    };

    return { users, pagination };
  }

  async findByIds(ids: string[]): Promise<Array<Estimator | Storekeeper>> {
    const user = this.items.filter((item) => ids.includes(item.id.toString()));

    return user;
  }

  async save(user: Storekeeper | Estimator) {
    const itemIndex = this.items.findIndex((item) => item.id == user.id);

    this.items[itemIndex] = user;
  }

  async findByEmail(email: string): Promise<Storekeeper | Estimator | null> {
    const user = this.items.find((item) => item.email.toString() === email);

    if (!user) return null;

    return user;
  }

  async delete(userId: string) {
    const itemIndex = this.items.findIndex(
      (item) => item.id.toString() == userId
    );

    this.items.splice(itemIndex, 1);
  }
}
