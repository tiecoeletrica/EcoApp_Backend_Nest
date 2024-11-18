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
import { ResourceAlreadyRegisteredError } from "src/core/errors/errors/resource-already-registered-error";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/core/errors/errors/resource-not-found-error";
import { CreateMaterialDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/material/response decorators/create-material.decorator";
import { CreateMaterialBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/material/dto classes/create-material.dto";
import { RegisterListOfMaterialsUseCase } from "src/domain/material-movimentation/application/use-cases/material/register-list-of-materials";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const registerListOfMaterialsBodySchema = z.array(
  z.object({
    code: z.number(),
    description: z.string().toUpperCase(),
    type: z.string(),
    unit: z.string(),
  })
);

@ApiTags("material")
@Controller("/materials-bulk")
export class RegisterListOfMaterialsController {
  constructor(private registerListMaterials: RegisterListOfMaterialsUseCase) {}

  @ApiBody({
    type: CreateMaterialBodyDto,
    isArray: true,
    description: "Array of materials to register",
  }) // for swagger
  @Post()
  @HttpCode(201)
  @CreateMaterialDecorator()
  @RoleAuth(UseCases.RegisterListOfMaterialsUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(registerListOfMaterialsBodySchema))
    body: CreateMaterialBodyDto[]
  ) {
    const result = await this.registerListMaterials.execute(
      body.map((req) => {
        return {
          code: req.code,
          description: req.description,
          type: req.type,
          unit: req.unit,
          contractId: user.contractId,
        };
      })
    );
    if (result.isLeft()) {
      this.handleError(result.value);
    }

    return { message: "Materiais registrados!" };
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
