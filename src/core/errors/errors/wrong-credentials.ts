import { UseCaseError } from "../use-case-error";

export class WrogCredentialsError extends Error implements UseCaseError {
  constructor() {
    super("As credenciais não são válidas");
  }
}
