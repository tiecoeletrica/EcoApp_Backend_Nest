import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { RegisterBaseUseCase } from "src/domain/material-movimentation/application/use-cases/contract-base/register-base";
import { ResourceAlreadyRegisteredError } from "src/domain/material-movimentation/application/use-cases/errors/resource-already-registered-error";
import { ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { RegisterBaseDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/contract-base/response decorators/register-base.decorator";
import { RegisterBaseBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/contract-base/dto classes/register-base.dto";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const registerBaseBodySchema = z
  .object({
    baseName: z.string(),
    contractId: z.string().uuid(),
  })
  .required();

@ApiTags("base")
@Controller("/bases")
export class RegisterBaseController {
  constructor(private registerBase: RegisterBaseUseCase) {}

  @Post()
  @HttpCode(201)
  @RegisterBaseDecorator()
  @RoleAuth(UseCases.RegisterBaseUseCase)
  async handle(
    @Body(new ZodValidationPipe(registerBaseBodySchema))
    body: RegisterBaseBodyDto
  ) {
    const { baseName, contractId } = body;

    const result = await this.registerBase.execute({
      baseName,
      contractId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceAlreadyRegisteredError:
          throw new ConflictException(error.message);
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    return { message: `Base '${baseName}' registrado` };
  }
}
