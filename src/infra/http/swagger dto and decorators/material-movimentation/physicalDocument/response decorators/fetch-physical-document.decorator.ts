import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const FetchPhysicalDocumentsDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "Identification attributed successfully",
      schema: {
        example: {
          physicalDocuments: [
            {
              id: "fc13dc69-7493-4644-9667-576cfaf85735",
              identifier: 1,
              unitized: true,
              project: {
                id: "30d2f9c4-decc-418a-bc5d-0fb16db7af57",
                project_number: "B-12345678",
              },
            },
            {
              id: "fc13dc69-7493-4644-9667-576cfaf85735",
              identifier: 1,
              unitized: true,
              project: {
                id: "30d2f9c4-decc-418a-bc5d-0fb16db7af57",
                project_number: "B-12345678",
              },
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
