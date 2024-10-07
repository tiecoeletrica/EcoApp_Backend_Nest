import { BadRequestException, ConflictException } from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { TransferMaterialUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/transfer-material";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { TransferMaterialDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/project-movimentation-budget/response decorators/transfer-material.decorator";
import { TransferMaterialBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/project-movimentation-budget/dto classes/transfer-material.dto";

const transferMaterialBodySchema = z.array(
  z
    .object({
      materialId: z.string().uuid(),
      projectId: z.string().uuid(),
      observation: z.string(),
      value: z.number(),
    })
    .required()
);

@ApiTags("movimentation")
@Controller("/movimentation")
export class TransferMaterialController {
  constructor(private transferMaterial: TransferMaterialUseCase) {}

  @Post()
  @HttpCode(201)
  @TransferMaterialDecorator()
  @ApiBody({
    type: TransferMaterialBodyDto,
    isArray: true,
  }) // for swagger
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(transferMaterialBodySchema))
    body: TransferMaterialBodyDto[]
  ) {
    const transferMaterialRequest: TransferMaterialBodyDto[] = body;

    const result = await this.transferMaterial.execute(
      transferMaterialRequest.map((item) => {
        return {
          storekeeperId: user.sub,
          materialId: item.materialId,
          projectId: item.projectId,
          observation: item.observation,
          baseId: user.baseId,
          value: item.value,
        };
      })
    );

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    return { message: "criação realizada" };
  }
}
