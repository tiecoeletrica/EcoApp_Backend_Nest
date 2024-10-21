import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class FetchBudgetByProjectNameQueryDto {
  @ApiProperty({
    example: "B-1234567",
    description: "project identification number",
  })
  project_number!: string;
  @ApiProperty({
    example: "false/true",
    description: "send 'true' to recive the project's projectId",
    required: false,
  })
  sendProjectId!: boolean;
}
