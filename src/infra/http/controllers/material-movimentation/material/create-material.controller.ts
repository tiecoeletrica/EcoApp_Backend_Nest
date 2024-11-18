import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { CreateMaterialUseCase } from "src/domain/material-movimentation/application/use-cases/material/create-material";
import { ResourceAlreadyRegisteredError } from "src/core/errors/errors/resource-already-registered-error";
import { ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/core/errors/errors/resource-not-found-error";
import { CreateMaterialDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/material/response decorators/create-material.decorator";
import { CreateMaterialBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/material/dto classes/create-material.dto";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const createMaterialBodySchema = z.object({
  code: z.number(),
  description: z.string().toUpperCase(),
  type: z.string(),
  unit: z.string(),
});

@ApiTags("material")
@Controller("/materials")
export class CreateMaterialController {
  constructor(private createMaterial: CreateMaterialUseCase) {}

  @Post()
  @HttpCode(201)
  @CreateMaterialDecorator()
  @RoleAuth(UseCases.CreateMaterialUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(createMaterialBodySchema))
    body: CreateMaterialBodyDto
  ) {
    const { code, description, type, unit } = body;

    const result = await this.createMaterial.execute({
      code,
      description,
      type,
      unit,
      contractId: user.contractId,
    });

    if (result.isLeft()) {
      this.handleError(result.value);
    }

    return {
      message: `Material ${
        result.isRight() ? result.value.material.code : ""
      } - ${result.isRight() ? result.value.material.description : ""} criado!`,
    };
  }

  private handleError(error: Error) {
    switch (error.constructor) {
      case ResourceNotFoundError:
        throw new NotFoundException(error.message);
      case ResourceAlreadyRegisteredError:
        throw new ConflictException(error.message);
      default:
        throw new BadRequestException(error.message);
    }
  }
}
