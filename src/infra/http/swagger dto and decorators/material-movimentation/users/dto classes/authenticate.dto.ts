import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

@Injectable()
export class AuthenticateBodyDto{
    @ApiProperty({
      description: 'Email of the user',
      example: 'colaborador@ecoeletrica.com.br',
    })
    email!: string;
  
    @ApiProperty({
      description: 'Password of the user',
      example: 'password123',
    })
    password!: string;
  }