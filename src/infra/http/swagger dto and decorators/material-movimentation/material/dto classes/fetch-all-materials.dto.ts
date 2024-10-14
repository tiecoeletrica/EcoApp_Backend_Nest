import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class FetchAllMaterialQueryDto {
  @ApiProperty({
    example: "CONCRETO | EQUIPAMENTO | SUCATA | FERRAGEM",
    description: "materials type",
    required: false,
  })
  type!: string;
}
