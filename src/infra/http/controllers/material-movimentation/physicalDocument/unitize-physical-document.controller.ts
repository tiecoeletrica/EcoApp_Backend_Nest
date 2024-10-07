import {
  BadRequestException,
  NotFoundException,
  Param,
  Put,
  UnauthorizedException,
} from "@nestjs/common";
import { Body, Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { UnitizePhysicalDocumentUseCase } from "src/domain/material-movimentation/application/use-cases/physicalDocument/unitize-physical-document";
import { NotAllowedError } from "src/domain/material-movimentation/application/use-cases/errors/not-allowed-error";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { ApiTags } from "@nestjs/swagger";
import { FetchBudgetByProjectNameDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/project-movimentation-budget/response decorators/fetch-budget-by-project-name.decorator";
import { UnitizePhysicalDocumentBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/physicalDocument/dto classes/unitize-physical-document.dto";

const unitizePhysicalDocumentBodySchema = z.object({
  unitized: z.boolean(),
});

@ApiTags("physical document")
@Controller("/physical-documents/:id")
export class UnitizePhysicalDocumentController {
  constructor(
    private unitizePhysicalDocument: UnitizePhysicalDocumentUseCase
  ) {}

  @Put()
  @HttpCode(201)
  @FetchBudgetByProjectNameDecorator()
  async handle(
    @Body(new ZodValidationPipe(unitizePhysicalDocumentBodySchema))
    body: UnitizePhysicalDocumentBodyDto,
    @Param("id") physicaldDocumentid: string
  ) {
    const { unitized } = body;

    const result = await this.unitizePhysicalDocument.execute({
      physicaldDocumentid,
      unitized,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotAllowedError:
          throw new UnauthorizedException();
        case ResourceNotFoundError:
          throw new NotFoundException();
        default:
          throw new BadRequestException();
      }
    }

    return { message: "edição realizada" };
  }
}
