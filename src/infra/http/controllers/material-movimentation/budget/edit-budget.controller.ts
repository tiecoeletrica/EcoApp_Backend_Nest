import {
  BadRequestException,
  NotFoundException,
  Param,
  Put,
} from "@nestjs/common";
import { Body, Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { EditBudgetUseCase } from "src/domain/material-movimentation/application/use-cases/budget/edit-budget";
import { ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { EditBudgetDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/response decorators/edit-budget.decorator";
import { EditBudgetBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/dto classes/edit-budget.dto";

const editBudgetBodySchema = z
  .object({
    updatedBudgets: z.array(
      z.object({
        budgetId: z.string().uuid(),
        value: z.number(),
      })
    ),
    newBudgets: z.array(
      z.object({
        materialId: z.string().uuid(),
        value: z.number(),
      }).optional()
    ),
  })
  .required();

@ApiTags("budgets")
@Controller("/budgets/:projectId")
export class EditBudgetController {
  constructor(private editBudget: EditBudgetUseCase) {}

  @Put()
  @HttpCode(201)
  @EditBudgetDecorator()
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(editBudgetBodySchema))
    body: EditBudgetBodyDto,
    @Param("projectId") projectId: string
  ) {
    const { updatedBudgets, newBudgets } = body;

    const result = await this.editBudget.execute({
      estimatorId: user.sub,
      projectId,
      updatedBudgets,
      newBudgets,
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

    return { message: "edição realizada" };
  }
}
