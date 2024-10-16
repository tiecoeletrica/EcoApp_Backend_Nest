import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  Param,
  Put,
  UnauthorizedException,
} from "@nestjs/common";
import { Body, Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { NotAllowedError } from "src/domain/material-movimentation/application/use-cases/errors/not-allowed-error";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { ApiTags } from "@nestjs/swagger";
import { EditAccountDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/users/response decorators/edit-account.decorator";
import { EditAccountBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/users/dto classes/edit-account.dto";
import { EditUserUseCase } from "src/domain/material-movimentation/application/use-cases/users/edit-user";
import { NotValidError } from "src/domain/material-movimentation/application/use-cases/errors/not-valid-error";
import { TokenInvalidationService } from "src/infra/auth/token-invalidation.service";
import { JwtService } from "@nestjs/jwt";

const editAccountBodyDto = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  baseId: z.string().uuid().optional(),
  contractId: z.string().uuid().optional(),
  password: z.string().min(6).optional(),
});

@ApiTags("user")
@Controller("/accounts/:id")
export class EditAccountController {
  constructor(
    private editUserUseCase: EditUserUseCase,
    private tokenInvalidationService: TokenInvalidationService,
    private jwtService: JwtService
  ) {}

  @Put()
  @HttpCode(201)
  @EditAccountDecorator()
  async handle(
    @Body(new ZodValidationPipe(editAccountBodyDto))
    body: EditAccountBodyDto,
    @CurrentUser() user: UserPayload,
    @Param("id") userId: string
  ) {
    const { password, status, type, baseId, contractId } = body;

    const result = await this.editUserUseCase.execute({
      authorId: user.sub,
      userId,
      type,
      baseId,
      contractId,
      status,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotValidError:
          throw new ConflictException(error.message);
        case NotAllowedError:
          throw new UnauthorizedException(error.message);
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    if (result.isRight()) {
      await this.tokenInvalidationService.invalidateUserTokens(userId);
    }

    return { message: "edição realizada" };
  }
}
