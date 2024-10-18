import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class FetchExistingBudgetByProjectsBodyDto {
  @ApiProperty({
    example: ["project-id-1", "project-id-1", "project-id-1"],
    description: "ids of projects",
    isArray: true,
  })
  projectIds!: string[];
}
