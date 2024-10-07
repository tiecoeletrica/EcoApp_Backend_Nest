import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const FetchMaterialDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "Fetched materials successfully",
      schema: {
        example: {
          materials: [
            {
              id: "7a7b5a91-e91a-4340-8a5f-5e1acdf502f8",
              code: 23456,
              description: "CRUZETA T 1900",
              type: "FERRAGEM",
              unit: "CDA",
            },
            {
              id: "d5fd168d-1a00-48b6-abe6-1668c9d4e507",
              code: 122456,
              description: "item poste 123",
              type: "FERRAGEM",
              unit: "CDA",
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
