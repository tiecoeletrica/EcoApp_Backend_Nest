import {
  BadRequestException,
  Delete,
  NotFoundException,
  Param,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { DeletePhysicalDocumentUseCase } from "src/domain/material-movimentation/application/use-cases/physicalDocument/delete-physical-document";
import { DeletePhysicalDocumentDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/physicalDocument/response decorators/delete-physical-document.decorator";

@ApiTags("physical document")
@Controller("/physical-documents/:id")
export class DeletePhysicalDocumentController {
  constructor(private deletePhysicalDocument: DeletePhysicalDocumentUseCase) {}

  @Delete()
  @HttpCode(201)
  @DeletePhysicalDocumentDecorator()
  async handle(@Param("id") physicalDocumentId: string) {
    const result = await this.deletePhysicalDocument.execute({
      physicalDocumentId,
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

    return { message: "exclusão realizada" };
  }
}
