// src/domain/auth/authorization.service.ts
import { Injectable } from "@nestjs/common";
import { Role } from "src/core/role-authorization/role.enum";
import { rolePermissions } from "src/core/role-authorization/rolePermissions";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

interface UserPayload {
  sub: string;
  type: Role;
  baseId: string;
  contractId: string;
}

@Injectable()
export class AuthorizationByRole {
  canUserPerformAction(
    user: UserPayload,
    useCase: UseCases
  ): { allowed: boolean; message?: string } {
    const userRole = user.type;
    const userPermissions = rolePermissions[userRole];
    const allowed = userPermissions?.includes(useCase) ?? false;

    if (!allowed) {
      return {
        allowed: false,
        message: `O usuário do tipo ${userRole} não tem permissão para executar essa ação`,
      };
    }

    return { allowed: true };
  }
}
