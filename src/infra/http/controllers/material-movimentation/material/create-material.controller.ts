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
import { ResourceAlreadyRegisteredError } from "src/domain/material-movimentation/application/use-cases/errors/resource-already-registered-error";
import { ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { CreateMaterialDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/material/response decorators/create-material.decorator";
import { CreateMaterialBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/material/dto classes/create-material.dto";

const createMaterialBodySchema = z
  .object({
    code: z.number(),
    description: z.string().toUpperCase(),
    type: z.string(),
    unit: z.string(),
  })
  .required();

@ApiTags("material")
@Controller("/materials")
export class CreateMaterialController {
  constructor(private createMaterial: CreateMaterialUseCase) {}

  @Post()
  @HttpCode(201)
  @CreateMaterialDecorator()
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
