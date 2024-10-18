import {
  BadRequestException,
  Get,
  NotFoundException,
  Query,
  Res,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { FetchAllMaterialUseCase } from "src/domain/material-movimentation/application/use-cases/material/fetch-all-material";
import { MaterialPresenter } from "../../../presenters/material-presenter";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { ApiTags } from "@nestjs/swagger";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { FetchAllMaterialQueryDto } from "src/infra/http/swagger dto and decorators/material-movimentation/material/dto classes/fetch-all-materials.dto";
import { FetchAllMaterialDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/material/response decorators/fetch-all-materials.decorator";
import type { Response } from "express";
import { Readable } from "stream";

const fetchMaterialQuerySchema = z.object({
  type: z.string().optional(),
});

@ApiTags("material")
@Controller("/materials-streaming")
export class FetchAllMaterialController {
  constructor(private fetchAllMaterialUseCase: FetchAllMaterialUseCase) {}

  @Get()
  @HttpCode(200)
  @FetchAllMaterialDecorator()
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(fetchMaterialQuerySchema))
    query: FetchAllMaterialQueryDto,
    @Res() response: Response
  ) {
    const { type } = query;

    const result = await this.fetchAllMaterialUseCase.execute({
      contractId: user.contractId,
      type,
    });
    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    response.setHeader("Content-Type", "application/json");
    response.setHeader("Transfer-Encoding", "chunked");

    const materialStream = new Readable({
      read() {},
    });

    materialStream.pipe(response);

    try {
      materialStream.push('{"materials":[');

      const materials = result.value.materials;
      materials.forEach((material, index) => {
        const materialJson = JSON.stringify(MaterialPresenter.toHTTP(material));
        materialStream.push(materialJson);
        if (index < materials.length - 1) {
          materialStream.push(",");
        }
      });

      materialStream.push("]}");
      materialStream.push(null);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
