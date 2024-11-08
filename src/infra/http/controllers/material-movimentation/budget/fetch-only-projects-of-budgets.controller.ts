import {
  BadRequestException,
  Body,
  NotFoundException,
  Post,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { FetchOnlyProjectsOfBudgetsUseCase } from "src/domain/material-movimentation/application/use-cases/budget/fetch-only-projects-of-budgets";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { ApiTags } from "@nestjs/swagger";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { FetchOnlyProjectsOfBudgetsDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/response decorators/fetch-only-projects-of-budgets.decorator";
import { FetchOnlyProjectsOfBudgetsBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/dto classes/fetch-only-projects-of-budgets.dto";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const fetchOnlyProjectsOfBudgetBodySchema = z
  .object({
    project_numbers: z.array(z.string().toUpperCase()),
  })
  .required();

@ApiTags("budgets")
@Controller("/budgets-only-projects")
export class FetchOnlyProjectsOfBudgetController {
  constructor(
    private fetchOnlyProjectsOfBudgetsUseCase: FetchOnlyProjectsOfBudgetsUseCase
  ) {}

  @Post() // it's post because the quantity of projects may trespass the url character length limit
  @HttpCode(200)
  @FetchOnlyProjectsOfBudgetsDecorator()
  @RoleAuth(UseCases.FetchOnlyProjectsOfBudgetsUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(fetchOnlyProjectsOfBudgetBodySchema))
    body: FetchOnlyProjectsOfBudgetsBodyDto
  ) {
    const { project_numbers } = body;

    const result = await this.fetchOnlyProjectsOfBudgetsUseCase.execute({
      project_numbers,
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

    const foundProjects = result.value.foundProjects;

    return { foundProjects };
  }
}
