import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const FetchProjectsBudgetsByMaterialsDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "fetched projects of budgets by materials successfully",
      schema: {
        example: {
          foundProjects: [
            {
              id: "30d2f9c4-decc-418a-bc5d-0fb16db7af57",
              project_number: "B-12345678",
            },
          ],
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
