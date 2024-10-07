import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Encrypter } from "src/domain/material-movimentation/application/cryptography/encrypter";

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private jwtService: JwtService) {}

  async encrypter(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
