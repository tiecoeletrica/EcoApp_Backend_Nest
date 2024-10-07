import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class EditAccountBodyDto {
    @ApiProperty({
      example: "ativo/inativo",
      description: "status of user, if is active or not",
      required: false,
    })
    status!: string;
    @ApiProperty({
      example: "Administrator/Storkeeper/Estimator",
      description: "establish the type of access of the user",
      required: false,
    })
    type!: string;
    @ApiProperty({
      example: "base-id",
      description:
        "base's id that a storekeeper que interect. undefined if the user is not a storekeeper",
      required: false,
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
      required: false,
    })
    password!: string;
  }