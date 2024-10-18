import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const FetchExistingBudgetByProjectsDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "fetched projects of budgets successfully",
      schema: {
        example: {
          budgets: [
            {
              id: "23eb1738-68ec-4d09-8d72-70b9a999d6d4",
              createdAt: "2024-08-21T13:23:09.331Z",
              value: 12,
              contract: {
                id: "e816f105-e022-4560-b32c-d2af40c18351",
                contractName: "Centro-Oeste Bahia",
              },
              user: {
                id: "627a842b-eeee-42f2-b8aa-9a9fbdee0b83",
                name: "Rodrigo",
                email: "rodrigo1@ecoeletrica.com.br",
              },
              project: {
                id: "30d2f9c4-decc-418a-bc5d-0fb16db7af57",
                project_number: "B-12345678",
                description: "MP-NUM-SEI-DAS-QUANTAS",
                city: "Ituí",
              },
              material: {
                id: "7a7b5a91-e91a-4340-8a5f-5e1acdf502f8",
                code: 23456,
                description: "CRUZETA T 1900",
                unit: "CDA",
                type: "FERRAGEM",
              },
            },
            {
              id: "a0f9c0ec-1c00-4c6a-9ea1-4470f306cd88",
              createdAt: "2024-09-30T14:33:27.067Z",
              value: 2,
              contract: {
                id: "e816f105-e022-4560-b32c-d2af40c18351",
                contractName: "Centro-Oeste Bahia",
              },
              user: {
                id: "627a842b-eeee-42f2-b8aa-9a9fbdee0b83",
                name: "Rodrigo",
                email: "rodrigo1@ecoeletrica.com.br",
              },
              project: {
                id: "44e9fa57-e4fd-4c41-a7d6-c456cc75ea98",
                project_number: "B-22345678",
                description: "MP-OBRA-ALEATORIA",
                city: "Ituí",
              },
              material: {
                id: "7a7b5a91-e91a-4340-8a5f-5e1acdf502f8",
                code: 23456,
                description: "CRUZETA T 1900",
                unit: "CDA",
                type: "FERRAGEM",
              },
            },
          ],
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
