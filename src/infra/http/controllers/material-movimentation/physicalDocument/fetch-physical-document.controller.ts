import {
  BadRequestException,
  Get,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { ResourceNotFoundError } from "src/core/errors/errors/resource-not-found-error";
import { FetchPhysicalDocumentUseCase } from "src/domain/material-movimentation/application/use-cases/physicalDocument/fetch-physical-document";
import { PhysicalDocumentWithProjectPresenter } from "src/infra/http/presenters/physical-document-with-project-presenter";
import { ApiTags } from "@nestjs/swagger";
import { FetchPhysicalDocumentsDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/physicalDocument/response decorators/fetch-physical-document.decorator";
import { FetchPhysicalDocumentsQueryDto } from "src/infra/http/swagger dto and decorators/material-movimentation/physicalDocument/dto classes/fetch-physical-document.dto";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";

const fetchPhysicalDocumentsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .pipe(z.number().min(1)),
  project_number: z.string().toUpperCase().optional(),
  identifier: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(1000))
    .optional(),
  unitized: z
    .enum(["false", "true"])
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      else return undefined;
    }),
});

@ApiTags("physical document")
@Controller("/physical-documents")
export class FetchPhysicalDocumentsController {
  constructor(private fetchPhysicalDocument: FetchPhysicalDocumentUseCase) {}

  @Get()
  @HttpCode(200)
  @FetchPhysicalDocumentsDecorator()
  @RoleAuth(UseCases.FetchPhysicalDocumentUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(fetchPhysicalDocumentsQuerySchema))
    query: FetchPhysicalDocumentsQueryDto
  ) {
    const { page, identifier, project_number, unitized } = query;

    const result = await this.fetchPhysicalDocument.execute({
      page,
      baseId: user.baseId,
      identifier,
      project_number,
      unitized,
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

    const physicalDocuments = result.value.physicalDocuments;
    const pagination = result.value.pagination;

    return {
      physicalDocuments: physicalDocuments.map(
        PhysicalDocumentWithProjectPresenter.toHTTP
      ),
      pagination,
    };
  }
}
