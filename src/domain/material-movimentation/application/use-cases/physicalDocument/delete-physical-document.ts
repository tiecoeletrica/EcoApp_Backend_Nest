import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { PhysicalDocumentRepository } from "../../repositories/physical-document-repository";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

interface DeletePhysicalDocumentUseCaseRequest {
  physicalDocumentId: string;
}

type DeletePhysicalDocumentResponse = Eihter<ResourceNotFoundError, null>;

@Injectable()
export class DeletePhysicalDocumentUseCase {
  constructor(private physicaldocumentRepository: PhysicalDocumentRepository) {}

  async execute({
    physicalDocumentId,
  }: DeletePhysicalDocumentUseCaseRequest): Promise<DeletePhysicalDocumentResponse> {
    const physicaldocument = await this.physicaldocumentRepository.findByID(
      physicalDocumentId
    );

    if (!physicaldocument) return left(new ResourceNotFoundError());

    await this.physicaldocumentRepository.delete(physicalDocumentId);

    return right(null);
  }
}
