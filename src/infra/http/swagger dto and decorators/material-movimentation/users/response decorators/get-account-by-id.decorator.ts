import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const GetAccountByidDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "Accounts fetched successfully",
      schema: {
        example: {
          user: {
            id: "f43c5f66-1323-4799-9d8f-23f962e4e1b6",
            name: "Joao da Silva",
            cpf: "12311312328",
            email: "joaodasilva@ecoeletrica.com.br",
            status: "ativo",
            type: "Almoxarife",
            base: {
              id: "b0d2281f-1336-4843-9b80-90f3d285eed5",
              baseName: "Ouricuri",
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Not Found Exception",
      schema: {
        example: {
          message: "Recurso não encontrado",
          error: "Not Found",
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Bad request",
      schema: {
        example: {
          statusCode: 400,
          message: "Invalid query parameters",
          error: "Bad Request",
        },
      },
    })
  );
};
