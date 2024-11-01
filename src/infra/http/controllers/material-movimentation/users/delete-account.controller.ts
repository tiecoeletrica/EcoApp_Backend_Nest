import {
  BadRequestException,
  Delete,
  ForbiddenException,
  NotFoundException,
  Param,
  UnauthorizedException,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { ApiTags } from "@nestjs/swagger";
import { NotAllowedError } from "src/domain/material-movimentation/application/use-cases/errors/not-allowed-error";
import { EditAccountDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/users/response decorators/edit-account.decorator";
import { DeleteUserUseCase } from "src/domain/material-movimentation/application/use-cases/users/delete-user";
import { UseCases } from "src/core/role-authorization/use-cases.enum";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";

@ApiTags("user")
@Controller("/accounts/:id")
export class DeleteAccountController {
  constructor(private deleteUserUseCase: DeleteUserUseCase) {}

  @Delete()
  @HttpCode(201)
  @EditAccountDecorator()
  @RoleAuth(UseCases.DeleteUserUseCase)
  async handle(@CurrentUser() user: UserPayload, @Param("id") userId: string) {
    const result = await this.deleteUserUseCase.execute({
      authorId: user.sub,
      userId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    return { message: "exclusão realizada" };
  }
}
