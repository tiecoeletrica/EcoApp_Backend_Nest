import {
  BadRequestException,
  Delete,
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
import { Storekeeper } from "src/domain/material-movimentation/enterprise/entities/storekeeper";
import { DeleteUserUseCase } from "src/domain/material-movimentation/application/use-cases/users/delete-user";

@ApiTags("user")
@Controller("/accounts/:id")
export class DeleteAccountController {
  constructor(private deleteUserUseCase: DeleteUserUseCase) {}

  @Delete()
  @HttpCode(201)
  @EditAccountDecorator()
  async handle(@CurrentUser() user: UserPayload, @Param("id") userId: string) {
    const result = await this.deleteUserUseCase.execute({
      authorId: user.sub,
      userId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotAllowedError:
          throw new UnauthorizedException();
        case ResourceNotFoundError:
          throw new NotFoundException();
        default:
          throw new BadRequestException();
      }
    }

    return { message: "exclusão realizada" };
  }
}
