import { UseCaseError } from "../../../../../core/errors/use-case-error";

export class ResourceAlreadyRegisteredError
  extends Error
  implements UseCaseError
{
  constructor(message: string = "Recurso já foi cadastrado") {
    super(message);
  }
}
