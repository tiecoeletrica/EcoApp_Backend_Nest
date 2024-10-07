import {
  BadRequestException,
  Body,
  NotFoundException,
  Post,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { FetchExistingBudgetByProjectsUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/fetch-existing-budgets-by-projects";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { ApiTags } from "@nestjs/swagger";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { FetchExistingBudgetByProjectsDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/project-movimentation-budget/response decorators/fetch-existing-budgets-by-projects.decorator";
import { FetchExistingBudgetByProjectsBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/project-movimentation-budget/dto classes/fetch-existing-budgets-by-projects.dto";
import { BudgetWithDetailsPresenter } from "src/infra/http/presenters/budget-with-details";

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
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(fetchExistingBudgetByProjectsBodySchema))
    body: FetchExistingBudgetByProjectsBodyDto
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

    const budgets = result.value.budgets;

    return { budgets: budgets.map(BudgetWithDetailsPresenter.toHTTP) };
  }
}
