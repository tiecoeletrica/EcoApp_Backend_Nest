import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Env } from "src/infra/env";
import { JwtStrategy } from "./jwt-strategy.guard";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { TokenInvalidationService } from "./token-invalidation.service";
import { AuthorizationByRole } from "src/domain/material-movimentation/application/authorization/authorization-by-role";
import { RoleGuard } from "./role.guard";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory(config: ConfigService<Env, true>) {
        const privateKey = config.get("JWT_PRIVATE_KEY", { infer: true });
        const publicKey = config.get("JWT_PUBLIC_KEY", { infer: true });
        return {
          privateKey: Buffer.from(privateKey, "base64"),
          publicKey: Buffer.from(publicKey, "base64"),
          signOptions: { algorithm: "RS256", expiresIn: "5h" }, // if modify expiresIn, modify expirationTime in src\infra\auth\token-invalidation.service.ts
        };
      },
    }),
  ],
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
    TokenInvalidationService,
    AuthorizationByRole,
  ],
  exports: [AuthorizationByRole],
})
export class AuthModule {}
