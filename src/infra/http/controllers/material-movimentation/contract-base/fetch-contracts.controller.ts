import {
  BadRequestException,
  Get,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { FetchContractUseCase } from "src/domain/material-movimentation/application/use-cases/contract-base/fetch-contract";
import { ResourceNotFoundError } from "src/core/errors/errors/resource-not-found-error";
import { ContractPresenter } from "src/infra/http/presenters/contract-presenter";
import { ApiTags } from "@nestjs/swagger";
import { FetchContractDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/contract-base/response decorators/fetch-contracts.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@ApiTags("contract")
@Controller("/contracts")
export class FetchContractController {
  constructor(private fetchContractUseCase: FetchContractUseCase) {}

  @Get()
  @HttpCode(200)
  @FetchContractDecorator()
  @RoleAuth(UseCases.FetchContractUseCase)
  async handle(@Query("page", queryValidationPipe) page: PageQueryParamSchema) {
    const result = await this.fetchContractUseCase.execute({
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

    const contracts = result.value.contracts;
    const pagination = result.value.pagination;

    return { contracts: contracts.map(ContractPresenter.toHTTP), pagination };
  }
}
