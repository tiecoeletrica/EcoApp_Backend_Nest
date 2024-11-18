import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { ResourceAlreadyRegisteredError } from "src/core/errors/errors/resource-already-registered-error";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/core/errors/errors/resource-not-found-error";
import { RegisterProjectDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/project/response decorators/register-project.decorator";
import { RegisterListOfProjectsUseCase } from "src/domain/material-movimentation/application/use-cases/project/register-list-of-projects";
import { UseCases } from "src/core/role-authorization/use-cases.enum";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { NotValidError } from "src/core/errors/errors/not-valid-error";
import { RegisterListOfProjectsBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/project/dto classes/register-list-of-projects.dto";

const registerProjectBodySchema = z.array(
  z.object({
    project_number: z.string().min(6).max(30).toUpperCase().trim(),
    description: z.string().trim(),
    type: z.string(),
    baseName: z.string(),
    city: z.string(),
  })
);

@ApiTags("project")
@Controller("/projects-bulk")
export class RegisterListOfProjectsController {
  constructor(private registerListProjects: RegisterListOfProjectsUseCase) {}

  @ApiBody({
    type: RegisterListOfProjectsBodyDto,
    isArray: true,
    description: "Array of projects to register",
  }) // for swagger
  @Post()
  @HttpCode(201)
  @RegisterProjectDecorator()
  @RoleAuth(UseCases.RegisterListOfProjectsUseCase)
  async handle(
    @Body(new ZodValidationPipe(registerProjectBodySchema))
    body: RegisterListOfProjectsBodyDto[]
  ) {
    if (Array.isArray(body)) {
      const result = await this.registerListProjects.execute(body);
      if (result.isLeft()) {
        this.handleError(result.value);
      }

      return { message: "projetos registrados" };
    }
  }

  private handleError(error: Error) {
    switch (error.constructor) {
      case ResourceNotFoundError:
        throw new NotFoundException(error.message);
      case NotValidError:
      case ResourceAlreadyRegisteredError:
        throw new ConflictException(error.message);
      default:
        throw new BadRequestException(error.message);
    }
  }
}
