import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class FetchAllMovimentationHistoryQueryDto {
  @ApiProperty({
    example: "Rodrigo",
    description: "user's partial name that made the movimentation",
    required: false,
  })
  name!: string;
  @ApiProperty({
    example: "B-1234567",
    description: "project's number that was movimetated",
    required: false,
  })
  project_number!: string;
  @ApiProperty({
    example: 123456,
    description: "material's code that was movimetated",
    required: false,
    minimum: 1,
  })
  material_code!: number;
  @ApiProperty({
    example: "2024-03-31",
    description: "start date for search",
    required: false,
  })
  startDate!: Date;
  @ApiProperty({
    example: "2024-03-31",
    description: "end date for search",
    required: false,
  })
  endDate!: Date;
}
