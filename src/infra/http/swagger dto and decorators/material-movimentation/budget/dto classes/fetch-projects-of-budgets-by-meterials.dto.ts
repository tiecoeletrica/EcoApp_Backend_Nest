import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class FetchProjectsBudgetsByMaterialsQueryDto {
  @ApiProperty({
    example: "123456,654321,2200020",
    description: "material codes split by ','",
    isArray: true,
  })
  material_codes!: number[];
}
