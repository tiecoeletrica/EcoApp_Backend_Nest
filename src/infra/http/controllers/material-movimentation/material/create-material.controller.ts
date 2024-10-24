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
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { CreateMaterialDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/material/response decorators/create-material.decorator";
import { CreateMaterialBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/material/dto classes/create-material.dto";
import { RegisterListOfMaterialsUseCase } from "src/domain/material-movimentation/application/use-cases/material/register-list-of-materials";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const createMaterialBodySchema = z.union([
  z.object({
    code: z.number(),
    description: z.string().toUpperCase(),
    type: z.string(),
    unit: z.string(),
  }),
  z.array(
    z.object({
      code: z.number(),
      description: z.string().toUpperCase(),
      type: z.string(),
      unit: z.string(),
    })
  ),
]);

@ApiTags("material")
@Controller("/materials")
export class CreateMaterialController {
  constructor(
    private createMaterial: CreateMaterialUseCase,
    private registerListMaterials: RegisterListOfMaterialsUseCase
  ) {}

  @ApiBody({
    type: CreateMaterialBodyDto,
    isArray: true,
    description: "Project or Array of projects to register",
  }) // for swagger
  @Post()
  @HttpCode(201)
  @CreateMaterialDecorator()
  @RoleAuth(UseCases.CreateMaterialUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(createMaterialBodySchema))
    body: CreateMaterialBodyDto | CreateMaterialBodyDto[]
  ) {
    if (Array.isArray(body)) {
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

      return { message: "materiais registrados" };
    }

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

    return { message: "material criado" };
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
