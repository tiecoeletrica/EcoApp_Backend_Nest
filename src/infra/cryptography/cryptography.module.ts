import { Module } from "@nestjs/common";
import { Encrypter } from "src/domain/material-movimentation/application/cryptography/encrypter";
import { HashComparer } from "src/domain/material-movimentation/application/cryptography/hash-comperer";
import { HashGenerator } from "src/domain/material-movimentation/application/cryptography/hash-generator";
import { JwtEncrypter } from "./jwt-encrypter.service";
import { BcryptHasher } from "./bcrypt-hasher.service";

@Module({
  providers: [
    {
      provide: Encrypter,
      useClass: JwtEncrypter,
    },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [
    {
      provide: Encrypter,
      useClass: JwtEncrypter,
    },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
})
export class CryptographyModule {}
