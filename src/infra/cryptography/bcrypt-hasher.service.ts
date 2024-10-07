import { compare, hash } from "bcryptjs";
import { HashComparer } from "src/domain/material-movimentation/application/cryptography/hash-comperer";
import { HashGenerator } from "src/domain/material-movimentation/application/cryptography/hash-generator";

export class BcryptHasher implements HashGenerator, HashComparer {
  private hashLength = 8;

  async hash(plain: string): Promise<string> {
    return await hash(plain, this.hashLength);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return await compare(plain, hash);
  }
}
