import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class TransferMaterialBodyDto {
  @ApiProperty({
    example: "material-id",
    description: "material's ID to be movimentated",
  })
  materialId!: string;
  @ApiProperty({
    example: "project-id",
    description:
      "project's ID that the material movimentated will be associate",
  })
  projectId!: string;
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
  @ApiProperty({
    example: new Date(),
    description: "optional date when the transfer has occur",
    required: false,
  })
  createdAt!: Date;
  @ApiProperty({
    example: true,
    description: "if true, ignore equipment validations",
    required: false,
  })
  ignoreValidations!: boolean;
}
