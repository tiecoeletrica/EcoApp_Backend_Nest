import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class FetchMaterialQueryDto {
  @ApiProperty({
    example: "1",
    description: "Page number for pagination",
    required: false,
    default: 1,
    minimum: 1,
  })
  page!: number;
  @ApiProperty({
    example: "CONCRETO | EQUIPAMENTO | SUCATA | FERRAGEM",
    description: "materials type",
    required: false,
  })
  type!: string;
}
