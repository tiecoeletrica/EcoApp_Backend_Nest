import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const EditBudgetsByMaterialDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: "Budget list edited successfully",
      schema: {
        type: "object",
        properties: {
          projects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  example: "78308196-39d3-4a72-8abf-585c59b3a725",
                },
                baseId: {
                  type: "string",
                  example: "468c0cdb-b89f-425c-8e8f-0551f5db94b7",
                },
                project_number: {
                  type: "string",
                  example: "B-1004343",
                },
                type: {
                  type: "string",
                  example: "obra",
                },
                city: {
                  type: "string",
                  example: "IACU",
                },
                description: {
                  type: "string",
                  example: "ER-CIND-RUA-VAZ SAMPAIO-RURAL",
                },
              },
            },
          },
          message: {
            type: "string",
            example: "Edição no(s) orçamento(s) realizada",
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Not Found Exception",
      schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Recurso não encontrado",
          },
          error: {
            type: "string",
            example: "Not Found",
          },
          statusCode: {
            type: "number",
            example: 404,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Bad request",
      schema: {
        type: "object",
        properties: {
          statusCode: {
            type: "number",
            example: 400,
          },
          message: {
            type: "string",
            example: "Invalid query parameters",
          },
          error: {
            type: "string",
            example: "Bad Request",
          },
        },
      },
    })
  );
};