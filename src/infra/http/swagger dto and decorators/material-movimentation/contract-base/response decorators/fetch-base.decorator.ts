import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const FetchBaseDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "Fetched bases successfully",
      schema: {
        example: {
          bases: [
            {
              id: "468c0cdb-b89f-425c-8e8f-0551f5db94b7",
              base: "Irecê",
              contract: {
                contractName: "Centro-Oeste Bahia",
                id: "e816f105-e022-4560-b32c-d2af40c18351",
              },
            },
            {
              id: "dbe82710-e5e8-449a-ba49-471b356f808d",
              base: "Itaberaba",
              contract: {
                contractName: "Centro-Oeste Bahia",
                id: "e816f105-e022-4560-b32c-d2af40c18351",
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
      status: 400,
      description: "Bad request",
      schema: {
        example: {
          statusCode: 400,
          message: "Invalid query parameters",
          error: "Bad Request",
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
    })
  );
};
