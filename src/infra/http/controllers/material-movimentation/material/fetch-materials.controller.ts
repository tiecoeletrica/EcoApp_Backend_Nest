import {
  BadRequestException,
  Get,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { FetchMaterialUseCase } from "src/domain/material-movimentation/application/use-cases/material/fetch-material";
import { MaterialPresenter } from "../../../presenters/material-presenter";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { ApiTags } from "@nestjs/swagger";
import { FetchMaterialDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/material/response decorators/fetch-materials.decorator";
import { FetchMaterialQueryDto } from "src/infra/http/swagger dto and decorators/material-movimentation/material/dto classes/fetch-materials.dto";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const fetchMaterialQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .pipe(z.number().min(1)),
  type: z.string().optional(),
});

@ApiTags("material")
@Controller("/materials")
export class FetchMaterialController {
  constructor(private fetchMaterialUseCase: FetchMaterialUseCase) {}

  @Get()
  @HttpCode(200)
  @FetchMaterialDecorator()
  @RoleAuth(UseCases.FetchMaterialUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(fetchMaterialQuerySchema))
    query: FetchMaterialQueryDto
  ) {
    const { page, type } = query;

    const result = await this.fetchMaterialUseCase.execute({
      contractId: user.contractId,
      page,
      type,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    const materials = result.value.materials;
    const pagination = result.value.pagination;

    return { materials: materials.map(MaterialPresenter.toHTTP), pagination };
  }
}
