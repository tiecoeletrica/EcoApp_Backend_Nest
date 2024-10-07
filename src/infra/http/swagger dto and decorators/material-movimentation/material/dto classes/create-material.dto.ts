import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class CreateMaterialBodyDto {
  @ApiProperty({
    example: 123456,
    description: "material's code. Has to be number",
  })
  code!: number;
  @ApiProperty({
    example: "CABO 4CAA ALMU",
    description: "material's description",
  })
  description!: string;
  @ApiProperty({
    example: "FERRAGEM",
    description:
      "It's one of the following types: FERRAGEM/CONCRETO/EQUIPAMENTO",
  })
  type!: string;
  @ApiProperty({
    example: "CDA",
    description: "The unit of the material. Could be M, CDA, UN, KG etc",
  })
  unit!: string;
}
