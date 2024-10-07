import {
  BadRequestException,
  Get,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { GetProjectByProjectNumberUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/get-project-by-project_number";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { ProjectPresenter } from "src/infra/http/presenters/preject-presenter";
import { GetProjectByProjectNumberQueryDto } from "src/infra/http/swagger dto and decorators/material-movimentation/project-movimentation-budget/dto classes/get-project-by-project_number.dto";
import { GetProjectByProjectNumberDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/project-movimentation-budget/response decorators/get-project-by-project_number.decorator";

const getProjectByProjectNumberQuerySchema = z.object({
  project_number: z.string().min(6),
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
