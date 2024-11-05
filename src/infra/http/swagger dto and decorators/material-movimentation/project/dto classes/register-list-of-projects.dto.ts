import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class RegisterListOfProjectsBodyDto {
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
    example: "Itaberaba | Irecê | Petrolina | Aparecida de Goiânia",
    description: "base's name of the project",
  })
  baseName!: string;
  @ApiProperty({
    example: "Ruy Barbosa",
    description: "project's city",
  })
  city!: string;
}
