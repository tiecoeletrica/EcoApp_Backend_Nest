import {
  BadRequestException,
  Get,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { FetchMovimentationHistoryUseCase } from "src/domain/material-movimentation/application/use-cases/movimentation/fetch-movimentations-history";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { MovimentationWithDetailsPresenter } from "src/infra/http/presenters/movimentation-with-details-presenter";
import { ApiTags } from "@nestjs/swagger";
import { FetchMovimentationHistoryDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/movimentation/response decorators/fetch-movimentations-history.decorator";
import { FetchMovimentationHistoryQueryDto } from "src/infra/http/swagger dto and decorators/material-movimentation/movimentation/dto classes/fetch-movimentations-history.dto";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";

const fetchMovimentationHistoryBodySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .pipe(z.number().min(1)),
  name: z.string().optional(),
  project_number: z.string().optional(),
  material_code: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().min(1).optional()),
  startDate: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
  endDate: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
});

@ApiTags("movimentation")
@Controller("/movimentations")
export class FetchMovimentationHistoryController {
  constructor(
    private fetchMovimentationHistoryUseCase: FetchMovimentationHistoryUseCase
  ) {}

  @Get()
  @HttpCode(200)
  @FetchMovimentationHistoryDecorator()
  @RoleAuth(UseCases.FetchMovimentationHistoryUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(fetchMovimentationHistoryBodySchema))
    query: FetchMovimentationHistoryQueryDto
  ) {
    const { page, project_number, name, endDate, material_code, startDate } =
      query;

    let endDateAjusted;

    if (endDate) {
      endDateAjusted = new Date(
        endDate.getUTCFullYear(),
        endDate.getUTCMonth(),
        endDate.getUTCDate() + 1
      );
    }

    const result = await this.fetchMovimentationHistoryUseCase.execute({
      page,
      baseId: user.baseId,
      name,
      project_number,
      material_code,
      startDate,
      endDate: endDateAjusted,
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

    const movimentations = result.value.movimentations;
    const pagination = result.value.pagination;

    return {
      movimentations: movimentations.map(
        MovimentationWithDetailsPresenter.toHTTP
      ),
      pagination,
    };
  }
}
