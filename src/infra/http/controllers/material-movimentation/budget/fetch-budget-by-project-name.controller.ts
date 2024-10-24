import {
  BadRequestException,
  Get,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { FetchBudgetByProjectNameUseCase } from "src/domain/material-movimentation/application/use-cases/budget/fetch-budget-by-project-name";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { BudgetWithDetailsPresenter } from "src/infra/http/presenters/budget-with-details";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { FetchBudgetByProjectNameDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/response decorators/fetch-budget-by-project-name.decorator";
import { FetchBudgetByProjectNameQueryDto } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/dto classes/fetch-budget-by-project-name.dto";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const fetchBudgetByProjectNameQuerySchema = z
  .object({
    project_number: z.string(),
    sendProjectId: z.string().optional().transform(Boolean),
  })
  .required();

@ApiTags("budgets")
@Controller("/budgets")
export class FetchBudgetByProjectNameController {
  constructor(
    private fetchBudgetByProjectNameUseCase: FetchBudgetByProjectNameUseCase
  ) {}

  @Get()
  @HttpCode(200)
  @FetchBudgetByProjectNameDecorator()
  @RoleAuth(UseCases.FetchBudgetByProjectNameUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(fetchBudgetByProjectNameQuerySchema))
    query: FetchBudgetByProjectNameQueryDto
  ) {
    const { project_number, sendProjectId } = query;

    const result = await this.fetchBudgetByProjectNameUseCase.execute({
      project_number,
      contractId: user.contractId,
      sendProjectId,
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
    const projectId = result.value.projectId;

    return {
      budgets: budgets.map(BudgetWithDetailsPresenter.toHTTP),
      projectId,
    };
  }
}
