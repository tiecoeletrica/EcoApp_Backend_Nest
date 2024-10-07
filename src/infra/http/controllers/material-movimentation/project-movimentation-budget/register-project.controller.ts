import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { RegisterProjectUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/register-project";
import { ResourceAlreadyRegisteredError } from "src/domain/material-movimentation/application/use-cases/errors/resource-already-registered-error";
import { ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { RegisterProjectDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/project-movimentation-budget/response decorators/register-project.decorator";
import { RegisterProjectBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/project-movimentation-budget/dto classes/register-project.dto";

const registerProjectBodySchema = z
  .object({
    project_number: z.string().min(6).max(20).toUpperCase(),
    description: z.string(),
    type: z.string(),
    baseId: z.string().uuid(),
    city: z.string(),
  })
  .required();

@ApiTags("project")
@Controller("/projects")
export class RegisterProjectController {
  constructor(private registerProject: RegisterProjectUseCase) {}

  @Post()
  @HttpCode(201)
  @RegisterProjectDecorator()
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
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case ResourceAlreadyRegisteredError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    return { message: "criação realizada" };
  }
}
