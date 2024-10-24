import {
  BadRequestException,
  Get,
  NotFoundException,
  Query,
  Res,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { FetchAllMovimentationHistoryUseCase } from "src/domain/material-movimentation/application/use-cases/movimentation/fetch-all-movimentations-history";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { MovimentationWithDetailsPresenter } from "src/infra/http/presenters/movimentation-with-details-presenter";
import { ApiTags } from "@nestjs/swagger";
import { FetchAllMovimentationHistoryDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/movimentation/response decorators/fetch-all-movimentations-history.decorator";
import { FetchAllMovimentationHistoryQueryDto } from "src/infra/http/swagger dto and decorators/material-movimentation/movimentation/dto classes/fetch-all-movimentations-history.dto";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import type { Response } from "express";
import { Readable } from "stream";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const fetchAllMovimentationHistoryBodySchema = z.object({
  email: z.string().email().optional(),
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
@Controller("/movimentations-streaming")
export class FetchAllMovimentationHistoryController {
  constructor(
    private fetchAllMovimentationHistoryUseCase: FetchAllMovimentationHistoryUseCase
  ) {}

  @Get()
  @HttpCode(200)
  @FetchAllMovimentationHistoryDecorator()
  @RoleAuth(UseCases.FetchAllMovimentationHistoryUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(fetchAllMovimentationHistoryBodySchema))
    query: FetchAllMovimentationHistoryQueryDto,
    @Res() response: Response
  ) {
    const { project_number, email, endDate, material_code, startDate } = query;

    let endDateAjusted;

    if (endDate) {
      endDateAjusted = new Date(
        endDate.getUTCFullYear(),
        endDate.getUTCMonth(),
        endDate.getUTCDate() + 1
      );
    }

    const result = await this.fetchAllMovimentationHistoryUseCase.execute({
      baseId: user.baseId,
      email,
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

    response.setHeader("Content-Type", "application/json");
    response.setHeader("Transfer-Encoding", "chunked");

    const movimentationStream = new Readable({
      read() {},
    });

    movimentationStream.pipe(response);

    try {
      movimentationStream.push('{"movimentations":[');
      const movimentations = result.value.movimentations;
      movimentations.forEach((movimentation, index) => {
        const movimentationJson = JSON.stringify(
          MovimentationWithDetailsPresenter.toHTTP(movimentation)
        );
        movimentationStream.push(movimentationJson);
        if (index < movimentations.length - 1) {
          movimentationStream.push(",");
        }
      });

      movimentationStream.push("]}");
      movimentationStream.push(null);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
