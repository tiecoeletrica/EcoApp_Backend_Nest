import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const FetchContractDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "Fetched contracts successfully",
      schema: {
        example: {
          contracts: [
            {
              id: "e816f105-e022-4560-b32c-d2af40c18351",
              contract: "Centro-Oeste Bahia",
            },
            {
              id: "a100663c-5a6d-4198-ad7b-1062afa0c4f4",
              contract: "Oeste Pernambuco",
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
