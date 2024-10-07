import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class RegisterBudgetBodyDto {
  @ApiProperty({
    example: "material-id",
    description: "material's ID to be registered",
  })
  materialId!: string;
  @ApiProperty({
    example: "project-id",
    description: "project's ID that the material registered will be associate",
  })
  projectId!: string;
  @ApiProperty({
    example: 3,
    description: "value to be registered",
  })
  value!: number;
}
