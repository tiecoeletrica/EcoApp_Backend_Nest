import { Injectable } from "@nestjs/common";
import { Eihter, left, right } from "../../../../../core/either";
import { UniqueEntityID } from "../../../../../core/entities/unique-entity-id";
import { Staging } from "../../../enterprise/entities/staging";
import { StagingRepository } from "../../repositories/staging-repository";
import { ResourceAlreadyRegisteredError } from "../../../../../core/errors/errors/resource-already-registered-error";
import { BaseRepository } from "../../repositories/base-repository";
import { ResourceNotFoundError } from "../../../../../core/errors/errors/resource-not-found-error";
import { ProjectRepository } from "../../repositories/project-repository";
import { UserRepository } from "../../repositories/user-repository";

interface RegisterStagingUseCaseRequest {
  supervisorId: string;
  baseId: string;
  type: "FERRAGEM" | "CONCRETO";
  project_number: string;
  lootDate: Date;
  observation?: string;
  origin: "ITENS PARCIAIS" | "ORÇAMENTO";
  transport?: "CARRETA" | "SAQUE";
  delivery?: "OBRA" | "REGIÃO";
}

type RegisterStagingResponse = Eihter<
  ResourceAlreadyRegisteredError | ResourceNotFoundError,
  {
    staging: Staging;
  }
>;

@Injectable()
export class RegisterStagingUseCase {
  constructor(
    private stagingRepository: StagingRepository,
    private baseRepository: BaseRepository,
    private projectRepository: ProjectRepository,
    private userRepository: UserRepository
  ) {}

  async execute({
    supervisorId,
    baseId,
    type,
    project_number,
    lootDate,
    observation,
    origin,
    transport,
    delivery,
  }: RegisterStagingUseCaseRequest): Promise<RegisterStagingResponse> {
    const base = await this.baseRepository.findById(baseId);
    if (!base) return left(new ResourceNotFoundError("baseId não encontrado"));

    const project =
      await this.projectRepository.findByProjectNumberAndContractId(
        project_number,
        base.contractId.toString()
      );
    if (!project)
      return left(
        new ResourceNotFoundError(
          `O projeto '${project_number}' não foi cadastrado `
        )
      );

    const [user] = await this.userRepository.findByIds([supervisorId]);
    if (!user) return left(new ResourceNotFoundError("userId não encontrado"));

    const lastIdentifier =
      await this.stagingRepository.findLastIdentifierByBaseId(baseId);

    const staging = Staging.create({
      supervisorId: user.id,
      type,
      baseId: new UniqueEntityID(baseId),
      projectId: project.id,
      lootDate,
      observation,
      origin,
      transport,
      delivery,
      identifier: `${
        lastIdentifier + (1).toString().padStart(6, "0")
      }_${base.baseName.slice(0, 3)}`,
    });

    await this.stagingRepository.create(staging);

    return right({ staging });
  }
}
