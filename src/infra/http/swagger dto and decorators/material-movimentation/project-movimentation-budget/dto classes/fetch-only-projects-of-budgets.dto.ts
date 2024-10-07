import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class FetchOnlyProjectsOfBudgetsBodyDto {
  @ApiProperty({
    example: ["B-1234567", "B-123456", "B-12345678"],
    description: "project identification numbers",
    isArray: true,
  })
  project_numbers!: string[];
}
