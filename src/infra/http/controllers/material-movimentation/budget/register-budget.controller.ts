import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { RegisterBudgetUseCase } from "src/domain/material-movimentation/application/use-cases/budget/register-budget";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { RegisterBudgetDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/response decorators/register-budget.decorator";
import { RegisterBudgetBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/dto classes/register-budget.dto";

const registerBudgetBodySchema = z.array(
  z
    .object({
      materialId: z.string().uuid(),
      projectId: z.string().uuid(),
      value: z.number(),
      createdAt: z
        .string()
        .optional()
        .transform((value) => (value ? new Date(value) : undefined)),
    })
    .required()
);

@ApiTags("budgets")
@Controller("/budgets")
export class RegisterBudgetController {
  constructor(private registerBudget: RegisterBudgetUseCase) {}

  @Post()
  @HttpCode(201)
  @RegisterBudgetDecorator()
  @ApiBody({
    type: RegisterBudgetBodyDto,
    isArray: true,
  }) // for swagger
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(registerBudgetBodySchema))
    body: RegisterBudgetBodyDto[]
  ) {
    const registerBudgetRequest: RegisterBudgetBodyDto[] = body;

    const result = await this.registerBudget.execute(
      registerBudgetRequest.map((item) => {
        return {
          estimatorId: user.sub,
          materialId: item.materialId,
          projectId: item.projectId,
          contractId: user.contractId,
          value: item.value,
          createdAt: item.createdAt,
        };
      })
    );

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    return { message: "criação realizada" };
  }
}
