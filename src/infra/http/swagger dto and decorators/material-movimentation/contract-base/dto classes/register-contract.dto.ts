import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class RegisterContractBodyDto {
  @ApiProperty({
    example: "Centro-Oeste",
    description: "Name of the contract",
  })
  contractName!: string;
}
