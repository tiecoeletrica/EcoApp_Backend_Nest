import { UseCaseError } from "../use-case-error";

export class WrongTypeError extends Error implements UseCaseError {
  constructor(
    message: string = "o 'type' informado precisa ser 'Administrador' ou 'Orçamentista' ou 'Almoxarife'"
  ) {
    super(message);
  }
}
