import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
  UsePipes,
} from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { ResourceAlreadyRegisteredError } from "src/domain/material-movimentation/application/use-cases/errors/resource-already-registered-error";
import { ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { CreateAccountDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/users/response decorators/create-account.decorator";
import { CreateAccountBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/users/dto classes/create-account.dto";
import { WrongTypeError } from "src/domain/material-movimentation/application/use-cases/errors/wrong-type";
import { RegisterUserUseCase } from "src/domain/material-movimentation/application/use-cases/users/register-user";
import { NotValidError } from "src/domain/material-movimentation/application/use-cases/errors/not-valid-error";
import { UseCases } from "src/core/role-authorization/use-cases.enum";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";

const createAccountBodyDto = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  cpf: z.string().regex(/^\d{11,}$/, "O CPF precisa ter 11 dígitos numéricos"),
  type: z.string(),
  baseId: z.string().uuid(),
  contractId: z.string().uuid().optional(),
});

@ApiTags("user")
@Controller("/accounts")
export class CreateAccountController {
  constructor(private registerUserUseCase: RegisterUserUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodyDto))
  @CreateAccountDecorator()
  @RoleAuth(UseCases.RegisterUserUseCase)
  async handle(@Body() body: CreateAccountBodyDto) {
    const { name, email, password, cpf, type, baseId, contractId } = body;

    const result = await this.registerUserUseCase.execute({
      name,
      email,
      password,
      cpf,
      type,
      baseId,
      contractId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotValidError:
          throw new ConflictException(error.message);
        case ResourceAlreadyRegisteredError:
          throw new ConflictException(error.message);
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case WrongTypeError:
          throw new UnprocessableEntityException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    return { message: "Usuário criado com sucesso!" };
  }
}
