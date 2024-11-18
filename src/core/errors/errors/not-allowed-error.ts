import { UseCaseError } from "../use-case-error";

export class NotAllowedError extends Error implements UseCaseError {
  constructor(message: string = "Sem permissão") {
    super(message);
  }
}
