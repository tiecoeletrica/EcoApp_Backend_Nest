import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class UnitizePhysicalDocumentBodyDto {
    @ApiProperty({
      example: true,
      description: "edit if a project is unitized or not",
    })
    unitized!: boolean;
  }