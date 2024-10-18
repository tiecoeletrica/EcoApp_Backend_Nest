import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const FetchBudgetMovimentationByProjectDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "fetched budget and movimentation successfully",
      schema: {
        example: {
          movimentations: [
            {
              id: "81569bd9-36b7-4c4e-969a-e3183317403b",
              createdAt: "2024-08-14T17:44:44.763Z",
              observation: "Num sei das quantas",
              value: -3,
              base: {
                id: "dbe82710-e5e8-449a-ba49-471b356f808d",
                baseName: "Itaberaba",
              },
              user: {
                id: "627a842b-eeee-42f2-b8aa-9a9fbdee0b83",
                name: "Rodrigo",
                email: "rodrigo1@ecoeletrica.com.br",
              },
              project: {
                id: "30d2f9c4-decc-418a-bc5d-0fb16db7af57",
                project_number: "B-12345678",
              },
              material: {
                id: "b21ba24a-b752-4415-9fc4-702ec851c5cf",
                code: 123456,
                description: "CABO 4/0",
                unit: "CDA",
                type: "FERRAGEM",
              },
            },
            {
              id: "2795d34f-7ad8-48ed-aacf-5c403b0e9596",
              createdAt: "2024-08-14T17:52:07.675Z",
              observation: "Num sei das quantas",
              value: -1,
              base: {
                id: "dbe82710-e5e8-449a-ba49-471b356f808d",
                baseName: "Itaberaba",
              },
              user: {
                id: "627a842b-eeee-42f2-b8aa-9a9fbdee0b83",
                name: "Rodrigo",
                email: "rodrigo1@ecoeletrica.com.br",
              },
              project: {
                id: "30d2f9c4-decc-418a-bc5d-0fb16db7af57",
                project_number: "B-12345678",
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
          physicalDocumentSearch: {
            id: "1e38e9a2-11a8-4050-8e29-c1ad28c2d46c",
            identifier: 10,
            unitized: false,
            project: {
              id: "30d2f9c4-decc-418a-bc5d-0fb16db7af57",
              project_number: "B-12345678",
            },
          },
          projectSearch: {
            _id: {
              value: "30d2f9c4-decc-418a-bc5d-0fb16db7af57",
            },
            props: {
              baseId: {
                value: "dbe82710-e5e8-449a-ba49-471b356f808d",
              },
              city: "Ituí",
              description: "MP-NUM-SEI-DAS-QUANTAS",
              project_number: "B-12345678",
              type: "obra",
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
