// src/infra/auth/use-case.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UseCases } from "src/core/role-authorization/use-cases.enum";
import { AuthorizationByRole } from "src/domain/material-movimentation/application/authorization/authorization-by-role";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authorizationByRole: AuthorizationByRole
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const useCase = this.reflector.get<UseCases>(
      "useCase",
      context.getHandler()
    );
    if (!useCase) {
      return true; // If no use case is specified, allow access
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const authResult = this.authorizationByRole.canUserPerformAction(
      user,
      useCase
    );
    if (!authResult.allowed) {
      throw new ForbiddenException(authResult.message);
    }

    return true;
  }
}
