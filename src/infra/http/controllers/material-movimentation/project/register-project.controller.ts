import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { RegisterProjectUseCase } from "src/domain/material-movimentation/application/use-cases/project/register-project";
import { ResourceAlreadyRegisteredError } from "src/domain/material-movimentation/application/use-cases/errors/resource-already-registered-error";
import { ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { RegisterProjectDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/project/response decorators/register-project.decorator";
import { RegisterProjectBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/project/dto classes/register-project.dto";
import { UseCases } from "src/core/role-authorization/use-cases.enum";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";

const registerProjectBodySchema = z.object({
  project_number: z.string().min(6).max(30).toUpperCase().trim(),
  description: z.string().trim(),
  type: z.string(),
  baseId: z.string().uuid(),
  city: z.string(),
});

@ApiTags("project")
@Controller("/projects")
export class RegisterProjectController {
  constructor(private registerProject: RegisterProjectUseCase) {}

  @Post()
  @HttpCode(201)
  @RegisterProjectDecorator()
  @RoleAuth(UseCases.RegisterProjectUseCase)
  async handle(
    @Body(new ZodValidationPipe(registerProjectBodySchema))
    body: RegisterProjectBodyDto
  ) {
    const { city, description, type, project_number, baseId } = body;
    const result = await this.registerProject.execute({
      city,
      description,
      type,
      project_number,
      baseId,
    });
    if (result.isLeft()) {
      this.handleError(result.value);
    }
    if (result.isRight())
      return {
        message: `Projeto '${result.value.project.project_number}' registrado`,
      };
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
