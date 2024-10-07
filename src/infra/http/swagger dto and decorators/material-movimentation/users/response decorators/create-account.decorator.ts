import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const CreateAccountDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: "Account created successfully",
      schema: {
        example: { message: "Usuário criado com sucesso!" },
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
    }),
    ApiResponse({
      status: 422,
      description: "Unprocessable Entity",
      schema: {
        example: {
          message:
            "o 'type' informado precisa ser 'Administrador' ou 'Orçamentista' ou 'Almoxarife'",
          error: "Unprocessable Entity",
          statusCode: 422,
        },
      },
    })
  );
};
