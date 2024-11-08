import {
  BadRequestException,
  Get,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { GetProjectByProjectNumberUseCase } from "src/domain/material-movimentation/application/use-cases/project/get-project-by-project_number";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { ProjectPresenter } from "src/infra/http/presenters/preject-presenter";
import { GetProjectByProjectNumberQueryDto } from "src/infra/http/swagger dto and decorators/material-movimentation/project/dto classes/get-project-by-project_number.dto";
import { GetProjectByProjectNumberDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/project/response decorators/get-project-by-project_number.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";

const getProjectByProjectNumberQuerySchema = z.object({
  project_number: z.string().toUpperCase().min(6),
});

@ApiTags("project")
@Controller("/projects")
export class GetProjectByProjectNumberController {
  constructor(
    private getProjectByProjectNumberUseCase: GetProjectByProjectNumberUseCase
  ) {}

  @Get()
  @HttpCode(200)
  @GetProjectByProjectNumberDecorator()
  @RoleAuth(UseCases.GetProjectByProjectNumberUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(getProjectByProjectNumberQuerySchema))
    query: GetProjectByProjectNumberQueryDto
  ) {
    const { project_number } = query;

    const result = await this.getProjectByProjectNumberUseCase.execute({
      project_number,
      contractId: user.contractId,
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

    const project = result.value.project;

    return {
      project: ProjectPresenter.toHTTP(project),
    };
  }
}
