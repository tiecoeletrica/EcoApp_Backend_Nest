import { UseCaseError } from "../use-case-error";

export class NotValidError extends Error implements UseCaseError {
  constructor(
    message: string = "Operação com pelo menos um parâmetro inválido"
  ) {
    super(message);
  }
}
