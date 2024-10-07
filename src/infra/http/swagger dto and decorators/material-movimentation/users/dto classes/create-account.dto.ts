import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class CreateAccountBodyDto {
  @ApiProperty({
    example: "João da Silva",
    description: "user's name",
  })
  name!: string;
  @ApiProperty({
    example: "joaosilva@ecoeletrica.com.br",
    description: "user's email in Ecoelétrica's domain",
  })
  email!: string;
  @ApiProperty({
    example: "12345678912",
    description: "user's CPF, just number with the zeros",
  })
  cpf!: string;
  @ApiProperty({
    example: "Administrador/Almoxarife/Orçamentista",
    description: "establish the type of access of the user",
  })
  type!: string;
  @ApiProperty({
    example: "base-id",
    description:
      "base's id that a storekeeper que interect. undefined if the user is not a storekeeper",
  })
  baseId!: string;
  @ApiProperty({
    example: "contract-id",
    description:
      "contract's id that a estimator que interect. undefined if the user is not a estimator",
    required: false,
  })
  contractId!: string;
  @ApiProperty({
    example: "password123",
    description: "user's password",
  })
  password!: string;
}
