import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const FetchAccountsDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "Accounts fetched successfully",
      schema: {
        example: {
          user: [
            {
              id: "1d25306b-4658-4d2e-bfd6-d7bd54334b7b",
              name: "rafafaafa",
              cpf: "07439759524",
              email: "joaovittor@ecoeletrica.com.br",
              status: "ativo",
              type: "Storkeeper",
              base: {
                id: "b69a4b5c-e93c-4eba-9c1b-9bd2fbbed65e",
                baseName: "Ouricuri",
              },
            },
            {
              id: "b3770b8f-576b-4eb2-8628-b2456442e4f4",
              name: "teste",
              cpf: "11111111111",
              email: "teste@ecoeletrica.com.br",
              status: "ativo",
              type: "Administrador",
              base: {
                id: "e0beedd2-6a9e-4e93-b180-32d0ebc437af",
                baseName: "Itaberaba",
              },
            },
          ],
          pagination: {
            page: 1,
            pageCount: 40,
            lastPage: 1,
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
