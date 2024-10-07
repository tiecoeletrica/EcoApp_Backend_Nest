import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const RegisterContractDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: "Contract registered successfully",
      schema: {
        example: { message: "criação realizada" },
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
