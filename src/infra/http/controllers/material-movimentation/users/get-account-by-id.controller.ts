import {
  BadRequestException,
  Get,
  NotFoundException,
  Param,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { ApiTags } from "@nestjs/swagger";
import { GetAccountByidDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/users/response decorators/get-account-by-id.decorator";
import { UserWithBaseContractPresenter } from "src/infra/http/presenters/user-with-base-contract-presenter";
import { GetUserByIdUseCase } from "src/domain/material-movimentation/application/use-cases/users/get-user-by-id";
import { UseCases } from "src/core/role-authorization/use-cases.enum";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";

@ApiTags("user")
@Controller("/accounts/:id")
export class GetAccountByidController {
  constructor(private getUserByIdUseCase: GetUserByIdUseCase) {}

  @Get()
  @HttpCode(200)
  @GetAccountByidDecorator()
  @RoleAuth(UseCases.GetUserByIdUseCase)
  async handle(@Param("id") id: string) {
    const result = await this.getUserByIdUseCase.execute({
      userId: id,
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

    return {
      user: UserWithBaseContractPresenter.toHTTPUser(result.value.user),
    };
  }
}
