import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const AuthenticateDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: "Account authenticated successfully",
      schema: {
        example: {
          access_token:
            "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MjdhODQyYi1lZWVlLTQyZjItYjhhYS05YTlmYmRlZTBiODMiLCJ0eXBlIjoiQWRtaW5pc3RyYXRvciIsImJhc2VJZCI6ImRiZTgyNzEwLWU1ZTgtNDQ5YS1iYTQ5LTQ3MWIzNTZmODA4ZCIsImlhdCI6MTcyNTQ3NjM2NH0.Up0q-gBW5ai7u01D7dFeB0zy1T0zm9ffqethtRuMwq1g2bVxB_XTqrzJRzVT9Z5m2rPW17Ysu408oCsG5Zg8ddFjwtIBhqhu_FL1eQjGqmAh6KVG4mPVXwd-ydAygpXLwYgjFrG_HVxnGTqlfcwvKenCq5euGa_Kk8dVAUCOy_TmPCGrWLXeG8mpQiU00XDMMrLLL7ozJNovCbRbwE1YjaShsRZuq4ZTx-fy5b5kiWw6Omh5iFKihYxAsA6d7I9KShXPA_hp4SRxRiM2qh2ms2adj2du5bZQ9ajjmsxSBH5Qj4-_hzF0qSpK7wqnbQ3nkOrfyPUGTyRhf7eaSrka_A",
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized Exception",
      schema: {
        example: {
          message: "As credenciais não são válidas",
          error: "Unauthorized",
          statusCode: 401,
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
