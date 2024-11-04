import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class FetchBudgetMovimentationByProjectQueryDto {
  @ApiProperty({
    example: "B-1234567",
    description: "project identification number",
  })
  project_number!: string;
  @ApiProperty({
    example: true,
    description: "if true, it'll be send physical documents related data",
    required: false,
  })
  physicalDocument!: boolean;
  @ApiProperty({
    example: "B-7654321",
    description: "if send, it'll be send all projects' information",
    required: false,
  })
  projectIn!: string;
  @ApiProperty({
    example: true,
    description:
      "if true, it'll be send the projectId of the searched project_number",
    required: false,
  })
  sendProjectId!: boolean;
}
