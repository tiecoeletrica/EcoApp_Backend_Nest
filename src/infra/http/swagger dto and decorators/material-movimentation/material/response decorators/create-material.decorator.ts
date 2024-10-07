import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const CreateMaterialDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: "Material registered successfully",
      schema: {
        example: { message: "criação realizada" },
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
    }),
    ApiResponse({
      status: 409,
      description: "Conflict Exception",
      schema: {
        example: {
          message: "ID já utilizado",
          error: "Conflict",
          statusCode: 409,
        },
      },
    })
  );
};
