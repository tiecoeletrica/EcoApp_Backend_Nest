import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Env } from "src/infra/env";
import { z } from "zod";
import { TokenInvalidationService } from "./token-invalidation.service";

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  type: z.string(),
  baseId: z.string().uuid(),
  contractId: z.string().uuid(),
  firstLogin: z.boolean(),
  cpf: z.string().regex(/^\d{11,}$/, "O CPF precisa ter 11 dígitos numéricos"),
  name: z.string(),
  email: z.string().email(),
});

export type UserPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService<Env, true>,
    private tokenInvalidationService: TokenInvalidationService
  ) {
    const publicKey = config.get("JWT_PUBLIC_KEY");

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, "base64"),
      algorithms: ["RS256"],
    });
  }

  async validate(payload: UserPayload & { iat: number }) {
    const parsedPayload = tokenPayloadSchema.parse(payload);
    const isInvalidated =
      await this.tokenInvalidationService.isTokenInvalidated(
        parsedPayload.sub,
        payload.iat ?? 0
      );
    if (isInvalidated) {
      throw new UnauthorizedException("O Token de acesso foi invalidado");
    }
    return parsedPayload;
  }
}
