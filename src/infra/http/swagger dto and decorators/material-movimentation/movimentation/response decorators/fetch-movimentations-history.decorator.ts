import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const FetchMovimentationHistoryDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "fetched movimentation successfully",
      schema: {
        example: {
          movimentations: [
            {
              id: "60bf5661-1b08-4bd7-aad2-f6316325f429",
              createdAt: "2024-08-14T17:46:54.813Z",
              observation: "Num sei das quantas",
              value: 1,
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
                id: "d5fd168d-1a00-48b6-abe6-1668c9d4e507",
                code: 122456,
                description: "item poste 123",
                unit: "CDA",
                type: "FERRAGEM",
              },
            },
            {
              id: "e7df182d-3c0c-4336-a517-b6b3674fabec",
              createdAt: "2024-08-14T17:46:54.813Z",
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
                id: "d5fd168d-1a00-48b6-abe6-1668c9d4e507",
                code: 122456,
                description: "item poste 123",
                unit: "CDA",
                type: "FERRAGEM",
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
