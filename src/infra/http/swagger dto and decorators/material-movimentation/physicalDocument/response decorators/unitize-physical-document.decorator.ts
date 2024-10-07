import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const UnitizePhysicalDocumentDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: "edited physical document successfully",
      schema: {
        example: { message: "edição realizada" },
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
