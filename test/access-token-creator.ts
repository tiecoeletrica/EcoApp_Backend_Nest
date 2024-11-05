import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserEntities } from "src/core/types/user-type";

@Injectable()
export class AccessTokenCreator {
  constructor(private jwt: JwtService) {}

  execute(user: UserEntities) {
    return this.jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
      firstLogin: user.firstLogin,
      cpf: user.cpf,
      name: user.name,
      email: user.email,
    });
  }
}
