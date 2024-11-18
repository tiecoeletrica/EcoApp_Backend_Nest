import { BadRequestException, NotFoundException, Put } from "@nestjs/common";
import { Body, Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { EditBudgetsByMaterialUseCase } from "src/domain/material-movimentation/application/use-cases/budget/edit-budgets-by-material";
import { ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/core/errors/errors/resource-not-found-error";
import { EditBudgetsByMaterialDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/response decorators/edit-budgets-by-material.decorator";
import { EditBudgetsByMaterialBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/dto classes/edit-budgets-by-material.dto";
import { ProjectPresenter } from "src/infra/http/presenters/preject-presenter";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const editBudgetsByMaterialBodySchema = z
  .object({
    project_numbers: z.array(z.string()),
    codeFrom: z.number(),
    codeTo: z.number(),
    multiplier: z.number(),
  })
  .required();

@ApiTags("budgets")
@Controller("/budgets-materials")
export class EditBudgetsByMaterialController {
  constructor(private editBudgetsByMaterial: EditBudgetsByMaterialUseCase) {}

  @Put()
  @HttpCode(201)
  @EditBudgetsByMaterialDecorator()
  @RoleAuth(UseCases.EditBudgetsByMaterialUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(editBudgetsByMaterialBodySchema))
    body: EditBudgetsByMaterialBodyDto
  ) {
    const { project_numbers, codeFrom, codeTo, multiplier } = body;

    const result = await this.editBudgetsByMaterial.execute({
      estimatorId: user.sub,
      contractId: user.contractId,
      project_numbers,
      codeFrom,
      codeTo,
      multiplier,
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

    const projects = result.value.projects.map(ProjectPresenter.toHTTP);

    return {
      projects,
      message: `Mudança no(s) orçamento(s) realizada do material '${codeFrom}' para o material '${codeTo}'`,
    };
  }
}
