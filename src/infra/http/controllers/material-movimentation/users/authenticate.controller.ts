import {
  BadRequestException,
  UnauthorizedException,
  UsePipes,
} from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { AuthenticateUserUseCase } from "src/domain/material-movimentation/application/use-cases/users/authenticate-user";
import { WrogCredentialsError } from "src/domain/material-movimentation/application/use-cases/errors/wrong-credentials";
import { Public } from "../../../../auth/public.guard";
import { ApiTags } from "@nestjs/swagger";
import { AuthenticateBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/users/dto classes/authenticate.dto";
import { TokenInvalidationService } from "src/infra/auth/token-invalidation.service";
import { JwtService } from "@nestjs/jwt";

const authenticateBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .required();

@ApiTags("auth")
@Controller("/sessions")
@Public()
export class AuthenticateController {
  constructor(
    private jwtService: JwtService,
    private tokenInvalidationService: TokenInvalidationService,
    private authenticateStorkeeper: AuthenticateUserUseCase
  ) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodyDto) {
    const { email, password } = body;

    const result = await this.authenticateStorkeeper.execute({
      email,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case WrogCredentialsError:
          throw new UnauthorizedException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    const { accessToken } = result.value;

    const decodedToken = this.jwtService.decode(accessToken)
    await this.tokenInvalidationService.invalidateUserTokens(decodedToken.sub);

    return { access_token: accessToken };
  }
}
