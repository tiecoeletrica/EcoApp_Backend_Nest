import {
  BadRequestException,
  Body,
  NotFoundException,
  Post,
  Res,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { FetchExistingBudgetByProjectsUseCase } from "src/domain/material-movimentation/application/use-cases/budget/fetch-existing-budgets-by-projects";
import { ApiTags } from "@nestjs/swagger";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { FetchExistingBudgetByProjectsDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/response decorators/fetch-existing-budgets-by-projects.decorator";
import { FetchExistingBudgetByProjectsBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/dto classes/fetch-existing-budgets-by-projects.dto";
import { BudgetWithDetailsPresenter } from "src/infra/http/presenters/budget-with-details";
import type { Response } from "express";
import { Readable } from "stream";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const fetchExistingBudgetByProjectsBodySchema = z
  .object({
    projectIds: z.array(z.string()),
  })
  .required();

@ApiTags("budgets")
@Controller("/fetch-existing-budgets")
export class FetchExistingBudgetByProjectsController {
  constructor(
    private fetchExistingBudgetByProjectssUseCase: FetchExistingBudgetByProjectsUseCase
  ) {}

  @Post() // it's post because the quantity of projects may trespass the url character length limit
  @HttpCode(200)
  @FetchExistingBudgetByProjectsDecorator()
  @RoleAuth(UseCases.FetchExistingBudgetByProjectsUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(fetchExistingBudgetByProjectsBodySchema))
    body: FetchExistingBudgetByProjectsBodyDto,
    @Res() response: Response
  ) {
    const { projectIds } = body;

    const result = await this.fetchExistingBudgetByProjectssUseCase.execute({
      projectIds,
      contractId: user.contractId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    response.setHeader("Content-Type", "application/json");
    response.setHeader("Transfer-Encoding", "chunked");

    const budgetStream = new Readable({
      read() {},
    });

    budgetStream.pipe(response);

    try {
      budgetStream.push('{"budgets":[');

      const budgets = result.value.budgets;
      budgets.forEach((budget, index) => {
        const budgetJson = JSON.stringify(
          BudgetWithDetailsPresenter.toHTTP(budget)
        );
        budgetStream.push(budgetJson);
        if (index < budgets.length - 1) {
          budgetStream.push(",");
        }
      });

      budgetStream.push("]}");
      budgetStream.push(null);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
