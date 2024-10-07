import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class IdentifierAttributionBodyDto {
  @ApiProperty({
    example: "B-1234567",
    description: "project's number of the physical document",
  })
  project_number!: string;
  @ApiProperty({
    example: 3,
    description: "ID or identifier of the physical document",
  })
  identifier!: number;
}
