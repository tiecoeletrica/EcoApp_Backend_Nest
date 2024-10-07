import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class RegisterProjectBodyDto {
  @ApiProperty({
    example: "B-1234567",
    description: "project's number or name",
  })
  project_number!: string;
  @ApiProperty({
    example: "MP-LAGOA-FUNDA",
    description: "Project's identification tag",
  })
  description!: string;
  @ApiProperty({
    example: "OC/OS/OBRA",
    description: "project's type",
  })
  type!: string;
  @ApiProperty({
    example: "base-id",
    description: "base's ID of the project",
  })
  baseId!: string;
  @ApiProperty({
    example: "Ruy Barbosa",
    description: "project's city",
  })
  city!: string;
}
