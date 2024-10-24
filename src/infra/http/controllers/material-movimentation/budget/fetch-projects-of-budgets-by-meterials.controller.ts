import {
  BadRequestException,
  Get,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { FetchProjectsBudgetsByMaterialsUseCase } from "src/domain/material-movimentation/application/use-cases/budget/fetch-projects-of-budgets-by-meterials";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { ApiTags } from "@nestjs/swagger";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { FetchProjectsBudgetsByMaterialsDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/response decorators/fetch-projects-of-budgets-by-meterials.decorator";
import { FetchProjectsBudgetsByMaterialsQueryDto } from "src/infra/http/swagger dto and decorators/material-movimentation/budget/dto classes/fetch-projects-of-budgets-by-meterials.dto";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const fetchProjectsBudgetsByMaterialsQuerySchema = z
  .object({
    material_codes: z
      .string()
      .optional()
      .transform((value) => {
        if (!value) return [];
        return value.split(",").map((code) => {
          const num = Number(code.trim());
          if (isNaN(num) || num < 1) {
            throw new Error(`Invalid material code: ${code}`);
          }
          return num;
        });
      })
      .pipe(z.array(z.number().min(1))),
  })
  .required();

@ApiTags("budgets")
@Controller("/budgets-materials")
export class FetchProjectsBudgetsByMaterialsController {
  constructor(
    private fetchProjectsBudgetsByMaterialsUseCase: FetchProjectsBudgetsByMaterialsUseCase
  ) {}
  
  @Get()
  @HttpCode(200)
  @FetchProjectsBudgetsByMaterialsDecorator()
  @RoleAuth(UseCases.FetchProjectsBudgetsByMaterialsUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(fetchProjectsBudgetsByMaterialsQuerySchema))
    query: FetchProjectsBudgetsByMaterialsQueryDto
  ) {
    const { material_codes } = query;

    const result = await this.fetchProjectsBudgetsByMaterialsUseCase.execute({
      material_codes,
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
