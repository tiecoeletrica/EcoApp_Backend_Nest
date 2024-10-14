import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const RegisterProjectDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: "Project(s) registered successfully",
      schema: {
        example: { message: "projeto(s) registrados" },
      },
    }),
    ApiResponse({
      status: 409,
      description: "Conflict Exception",
      schema: {
        example: {
          message: "O email informado já foi cadastrado!",
          error: "Conflict",
          statusCode: 409,
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
