import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { IdentifierAttributionUseCase } from "src/domain/material-movimentation/application/use-cases/physicalDocument/identifier-attribution";
import { ResourceAlreadyRegisteredError } from "src/domain/material-movimentation/application/use-cases/errors/resource-already-registered-error";
import { ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { IdentifierAttributionBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/physicalDocument/dto classes/identifier-attribution.dto";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { IdentifierAttributionDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/physicalDocument/response decorators/identifier-attribution.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";

const identifierAttributionBodySchema = z.object({
  project_number: z.string(),
  identifier: z.number().min(1).max(1000),
});

@ApiTags("physical document")
@Controller("/physical-documents")
export class IdentifierAttributionController {
  constructor(private identifierAttribution: IdentifierAttributionUseCase) {}

  @Post()
  @HttpCode(201)
  @IdentifierAttributionDecorator()
  @RoleAuth(UseCases.IdentifierAttributionUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(identifierAttributionBodySchema))
    body: IdentifierAttributionBodyDto
  ) {
    const { project_number, identifier } = body;

    const result = await this.identifierAttribution.execute({
      project_number,
      identifier,
      baseId: user.baseId,
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

    return { message: "criação realizada" };
  }
}
