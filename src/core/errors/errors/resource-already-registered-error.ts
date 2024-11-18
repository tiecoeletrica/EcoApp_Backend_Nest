import { UseCaseError } from "../use-case-error";

export class ResourceAlreadyRegisteredError
  extends Error
  implements UseCaseError
{
  constructor(message: string = "Recurso já foi cadastrado") {
    super(message);
  }
}
