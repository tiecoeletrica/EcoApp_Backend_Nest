import {
  BadRequestException,
  Get,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { FetchBaseUseCase } from "src/domain/material-movimentation/application/use-cases/contract-base/fetch-base";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { BasePresenter } from "src/infra/http/presenters/base-presenter";
import { ApiTags } from "@nestjs/swagger";
import { FetchBaseDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/contract-base/response decorators/fetch-base.decorator";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@ApiTags("base")
@Controller("/bases")
export class FetchBaseController {
  constructor(private fetchBaseUseCase: FetchBaseUseCase) {}

  @Get()
  @HttpCode(200)
  @FetchBaseDecorator()
  @RoleAuth(UseCases.FetchBaseUseCase)
  async handle(@Query("page", queryValidationPipe) page: PageQueryParamSchema) {
    const result = await this.fetchBaseUseCase.execute({
      page,
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

    const bases = result.value.bases;
    const pagination = result.value.pagination;

    return { bases: bases.map(BasePresenter.toHTTP), pagination };
  }
}
