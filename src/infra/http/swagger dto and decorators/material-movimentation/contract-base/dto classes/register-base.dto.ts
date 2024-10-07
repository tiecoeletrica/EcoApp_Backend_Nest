import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class RegisterBaseBodyDto {
  @ApiProperty({
    example: "Itaberaba",
    description: "Name of the base",
  })
  baseName!: string;
  @ApiProperty({
    example: "contract-id",
    description: "contract's id of that base",
  })
  contractId!: string;
}
