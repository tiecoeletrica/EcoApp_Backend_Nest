import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class GetProjectByProjectNumberQueryDto {
  @ApiProperty({
    example: "B-1234567",
    description: "project's number that was movimetated",
    required: false,
  })
  project_number!: string;
}
