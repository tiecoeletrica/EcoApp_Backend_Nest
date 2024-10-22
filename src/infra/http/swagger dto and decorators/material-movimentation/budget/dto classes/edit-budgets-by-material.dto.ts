import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class EditBudgetsByMaterialBodyDto {
  @ApiProperty({
    example: ["B-123456", "B-test"],
    description: "Array of project numbers to replace budget",
    isArray: true,
  })
  project_numbers!: string[];
  @ApiProperty({
    example: 123456,
    description: "code number of the material that'll be removed",
  })
  codeFrom!: number;
  @ApiProperty({
    example: 123456,
    description: "code number of the material that'll be inserted",
  })
  codeTo!: number;
  @ApiProperty({
    example: 2,
    description:
      "multiplier paramter to replace the materials. if '1' the same quantity'll be created in the new material",
  })
  multiplier!: number;
}
