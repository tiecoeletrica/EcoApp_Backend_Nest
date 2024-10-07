import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class TransferMovimentationBetweenProjectsBodyDto {
  @ApiProperty({
    example: "material-id",
    description: "material's ID to be transfer",
  })
  materialId!: string;
  @ApiProperty({
    example: "project-out-id",
    description: "project's ID that the material will be output from",
  })
  projectIdOut!: string;
  @ApiProperty({
    example: "project-in-id",
    description: "project's ID that the material will go into",
  })
  projectIdIn!: string;
  @ApiProperty({
    example: "o material estava com a embalagem rasgada",
    description: "observation of the transfer of that material",
  })
  observation!: string;
  @ApiProperty({
    example: 3,
    description: "value to be transfer",
  })
  value!: number;
}
