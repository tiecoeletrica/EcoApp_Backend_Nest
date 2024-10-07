import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const GetProjectByProjectNumberDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "get project successfully",
      schema: {
        example: {
          project: {
            id: "30d2f9c4-decc-418a-bc5d-0fb16db7af57",
            baseId: "dbe82710-e5e8-449a-ba49-471b356f808d",
            project_number: "B-12345678",
            type: "obra",
            city: "Ituí",
            description: "MP-NUM-SEI-DAS-QUANTAS",
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
