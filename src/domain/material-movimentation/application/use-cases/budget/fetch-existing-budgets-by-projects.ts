import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { BudgetRepository } from "../../repositories/budget-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";
import { BudgetWithDetails } from "src/domain/material-movimentation/enterprise/entities/value-objects/budget-with-details";

interface FetchExistingBudgetByProjectsUseCaseRequest {
  projectIds: string[];
  contractId: string;
}

type FetchExistingBudgetByProjectsUseCaseResponse = Eihter<
  ResourceNotFoundError,
  {
    budgets: BudgetWithDetails[];
  }
>;

@Injectable()
export class FetchExistingBudgetByProjectsUseCase {
  constructor(private budgetRepository: BudgetRepository) {}

  async *execute({
    projectIds,
    contractId,
  }: FetchExistingBudgetByProjectsUseCaseRequest): AsyncGenerator<
    FetchExistingBudgetByProjectsUseCaseResponse,
    void,
    unknown
  > {
    for await (const budgets of this.budgetRepository.findByProjectIdsWithDetails(
      projectIds,
      contractId
    )) {
      if (!budgets.length)
        yield left(
          new ResourceNotFoundError("Nenhum orçamento não encontrado")
        );

      yield right({ budgets });
    }
  }
}
