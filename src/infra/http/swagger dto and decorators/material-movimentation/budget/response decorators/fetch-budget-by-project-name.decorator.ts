import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const FetchBudgetByProjectNameDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "fetched budget successfully",
      schema: {
        example: {
          budgets: [
            {
              id: "dccf3132-e37e-4e94-937e-f7d3933061cb",
              createdAt: "2024-08-21T13:21:51.328Z",
              value: 4.58,
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
                id: "d5fd168d-1a00-48b6-abe6-1668c9d4e507",
                code: 122456,
                description: "item poste 123",
                unit: "CDA",
                type: "FERRAGEM",
              },
            },
            {
              id: "245dedfe-2c7c-4e6e-b10f-a6003a53d601",
              createdAt: "2024-08-21T13:23:09.331Z",
              value: 250,
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
                id: "b21ba24a-b752-4415-9fc4-702ec851c5cf",
                code: 123456,
                description: "CABO 4/0",
                unit: "CDA",
                type: "FERRAGEM",
              },
            },
          ],
          projectId: "b21ba24a-b752-4415-9fc4-702ec851c5cf",
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
