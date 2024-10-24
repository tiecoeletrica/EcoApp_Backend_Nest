import { beforeEach, describe, expect, it } from "vitest";
import { AuthorizationByRole } from "./authorization-by-role";
import { UseCases } from "src/core/role-authorization/use-cases.enum";
import { Role } from "src/core/role-authorization/role.enum";

let sut: AuthorizationByRole;

describe("Authorize By Role", () => {
  beforeEach(() => {
    sut = new AuthorizationByRole();
  });

  it("should be able to authorize an use case", async () => {
    const userPayload = {
      sub: "id",
      type: "Administrador" as Role,
      baseId: "base",
      contractId: "contract",
    };

    const result = sut.canUserPerformAction(
      userPayload,
      UseCases.RegisterUserUseCase
    );

    expect(result).toBeTruthy();
  });

  it("should be able to unauthorize an use case", async () => {
    const userPayload = {
      sub: "id",
      type: "Orçamentista" as Role,
      baseId: "base",
      contractId: "contract",
    };

    const result = sut.canUserPerformAction(
      userPayload,
      UseCases.RegisterUserUseCase
    );

    expect(result).toBeFalsy();
  });

  it("should be able to authorize an use case for Storekeeper and unauthorize the same use case for Estimator", async () => {
    const storekeeperPayload = {
      sub: "id",
      type: "Almoxarife" as Role,
      baseId: "base",
      contractId: "contract",
    };

    const estimatorPayload = {
      sub: "id",
      type: "Orçamentista" as Role,
      baseId: "base",
      contractId: "contract",
    };

    const resultStorekeeper = sut.canUserPerformAction(
      storekeeperPayload,
      UseCases.TransferMaterialUseCase
    );

    const resultEstimator = sut.canUserPerformAction(
      estimatorPayload,
      UseCases.TransferMaterialUseCase
    );

    expect(resultStorekeeper).toBeTruthy();
    expect(resultEstimator).toBeFalsy();
  });
});
