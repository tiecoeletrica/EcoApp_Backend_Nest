import { BadRequestException, ConflictException } from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { RegisterContractUseCase } from "src/domain/material-movimentation/application/use-cases/contract-base/register-contract";
import { ResourceAlreadyRegisteredError } from "src/domain/material-movimentation/application/use-cases/errors/resource-already-registered-error";
import { ApiProperty, ApiTags } from "@nestjs/swagger";
import { RegisterContractDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/contract-base/response decorators/register-contract.decorator";
import { RegisterContractBodyDto } from "src/infra/http/swagger dto and decorators/material-movimentation/contract-base/dto classes/register-contract.dto";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const registerContractBodySchema = z
  .object({
    contractName: z.string(),
  })
  .required();

@ApiTags("contract")
@Controller("/contracts")
export class RegisterContractController {
  constructor(private registerContract: RegisterContractUseCase) {}

  @Post()
  @HttpCode(201)
  @RegisterContractDecorator()
  @RoleAuth(UseCases.RegisterContractUseCase)
  async handle(
    @Body(new ZodValidationPipe(registerContractBodySchema))
    body: RegisterContractBodyDto
  ) {
    const { contractName } = body;

    const result = await this.registerContract.execute({
      contractName,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceAlreadyRegisteredError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    return { message: "criação realizada" };
  }
}
