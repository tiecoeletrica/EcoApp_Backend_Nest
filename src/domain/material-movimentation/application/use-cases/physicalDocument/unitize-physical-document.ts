import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { PhysicalDocumentRepository } from "../../repositories/physical-document-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

interface UnitizePhysicalDocumentUseCaseRequest {
  physicaldDocumentid: string;
  unitized: boolean;
}

type UnitizePhysicalDocumentResponse = Eihter<ResourceNotFoundError, null>;

@Injectable()
export class UnitizePhysicalDocumentUseCase {
  constructor(private physicaldocumentRepository: PhysicalDocumentRepository) {}

  async execute({
    physicaldDocumentid,
    unitized,
  }: UnitizePhysicalDocumentUseCaseRequest): Promise<UnitizePhysicalDocumentResponse> {
    const physicalDocument = await this.physicaldocumentRepository.findByID(
      physicaldDocumentid
    );

    if (!physicalDocument) return left(new ResourceNotFoundError("ID não econtrado"));

    physicalDocument.unitized = unitized;

    await this.physicaldocumentRepository.save(physicalDocument);

    return right(null);
  }
}
