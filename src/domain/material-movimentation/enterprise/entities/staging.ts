import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Optional } from "src/core/types/optional";
import { StageTypes } from "src/core/types/stage-type";

export interface StagingProps {
  supervisorId: UniqueEntityID;
  baseId: UniqueEntityID;
  type: "FERRAGEM" | "CONCRETO";
  projectId: UniqueEntityID;
  lootDate: Date;
  observation?: string;
  origin: "ITENS PARCIAIS" | "ORÇAMENTO";
  transport?: "CARRETA" | "SAQUE";
  delivery?: "OBRA" | "REGIÃO";
  createdAt: Date;
  identifier: string;
  stage: StageTypes;
}

export class Staging extends Entity<StagingProps> {
  private ferragemStages: Array<Partial<StageTypes>> = [
    "AGUARDANDO SEPARAÇÃO",
    "EM SEPARAÇÃO",
    "AGUARDANDO SAQUE",
    "OK",
  ];

  private concretoSaqueStages: Array<Partial<StageTypes>> = [
    "AGUARDANDO RETIRADA",
    "OK",
  ];

  private concretoCarretaStages: Array<Partial<StageTypes>> = [
    "AGUARDANDO PROGRAMAÇÃO",
    "PROGRAMADO",
    "OK",
  ];

  private endStages: Array<Partial<StageTypes>> = [
    "OK",
    "IMPROCEDENTE",
    "CANCELADO",
  ];

  get supervisorId() {
    return this.props.supervisorId;
  }

  set supervisorId(supervisorId: UniqueEntityID) {
    this.props.supervisorId = supervisorId;
  }
  get baseId() {
    return this.props.baseId;
  }

  set baseId(baseId: UniqueEntityID) {
    this.props.baseId = baseId;
  }

  get type() {
    return this.props.type;
  }

  set type(type: "FERRAGEM" | "CONCRETO") {
    this.props.type = type;
  }

  get projectId() {
    return this.props.projectId;
  }

  set projectId(projectId: UniqueEntityID) {
    this.props.projectId = projectId;
  }

  get lootDate() {
    return this.props.lootDate;
  }

  set lootDate(lootDate: Date) {
    this.props.lootDate = lootDate;
  }

  get observation() {
    return this.props.observation;
  }

  set observation(observation: string | undefined) {
    this.props.observation = observation;
  }

  get origin() {
    return this.props.origin;
  }

  set origin(origin: "ITENS PARCIAIS" | "ORÇAMENTO") {
    this.props.origin = origin;
  }

  get transport() {
    return this.props.transport;
  }

  set transport(transport: "CARRETA" | "SAQUE" | undefined) {
    this.props.transport = transport;
  }

  get delivery() {
    return this.props.delivery;
  }

  set delivery(delivery: "OBRA" | "REGIÃO" | undefined) {
    this.props.delivery = delivery;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  set createdAt(createdAt: Date) {
    this.props.createdAt = createdAt;
  }

  get identifier() {
    return this.props.identifier;
  }

  set identifier(identifier: string) {
    this.props.identifier = identifier;
  }

  get stage() {
    return this.props.stage;
  }

  set stage(stage: StageTypes) {
    this.props.stage = stage;
  }

  static create(
    props: Optional<StagingProps, "createdAt" | "stage">,
    id?: UniqueEntityID
  ) {
    const staging = new Staging(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        stage:
          props.stage ??
          (props.type === "FERRAGEM"
            ? "AGUARDANDO SEPARAÇÃO"
            : props.transport === "SAQUE"
            ? "AGUARDANDO RETIRADA"
            : "AGUARDANDO PROGRAMAÇÃO"),
      },
      id
    );

    return staging;
  }

  nextStage(): { currentStage: StageTypes; nextStage: StageTypes } {
    let stages: Array<Partial<StageTypes>>;

    switch (this.props.type + this.props.transport) {
      case "CONCRETOSAQUE":
        stages = this.concretoSaqueStages;
        break;
      case "CONCRETOCARRETA":
        stages = this.concretoCarretaStages;
        break;
      default:
        stages = this.ferragemStages;
        break;
    }

    const index = stages.findIndex((stage) => this.props.stage === stage);

    if (!this.endStages.includes(this.props.stage)) {
      const currentStage = this.props.stage;
      this.props.stage = stages[index + 1] ?? this.props.stage;
      const nextStage = this.props.stage;

      return { currentStage, nextStage };
    } else {
      const currentStage = this.props.stage;
      const nextStage = this.props.stage;

      return { currentStage, nextStage };
    }
  }

  previousStage(): { currentStage: StageTypes; nextStage: StageTypes } {
    let stages: Array<Partial<StageTypes>>;

    switch (this.props.type + this.props.transport) {
      case "CONCRETOSAQUE":
        stages = this.concretoSaqueStages;
        break;
      case "CONCRETOCARRETA":
        stages = this.concretoCarretaStages;
        break;
      default:
        stages = this.ferragemStages;
        break;
    }

    const index = stages.findIndex((stage) => this.props.stage === stage);
    if (!this.endStages.includes(this.props.stage)) {
      const currentStage = this.props.stage;
      this.props.stage = stages[index - 1] ?? this.props.stage;
      const nextStage = this.props.stage;

      return { currentStage, nextStage };
    } else {
      const currentStage = this.props.stage;
      const nextStage = this.props.stage;

      return { currentStage, nextStage };
    }
  }

  cancel(cancelStage: string): { result: boolean; message?: string } {
    const allStageTypes: StageTypes[] = [
      "AGUARDANDO SEPARAÇÃO",
      "EM SEPARAÇÃO",
      "AGUARDANDO SAQUE",
      "OK",
      "CANCELADO",
      "IMPROCEDENTE",
      "AGUARDANDO RETIRADA",
      "AGUARDANDO PROGRAMAÇÃO",
    ];

    if (!allStageTypes.includes(cancelStage as StageTypes)) {
      return {
        result: false,
        message: `O estágio '${cancelStage}' não é um estágio válido`,
      };
    }

    const cancelOptions: Array<StageTypes> = ["IMPROCEDENTE", "CANCELADO"];

    if (!cancelOptions.includes(cancelStage as StageTypes)) {
      return {
        result: false,
        message: `O estágio '${cancelStage}' não é de cancelamento`,
      };
    }

    if (this.endStages.includes(this.props.stage)) {
      return {
        result: false,
        message: `O estágio '${cancelStage}' não pode ser alterado`,
      };
    }

    this.props.stage = cancelStage as StageTypes;
    return { result: true };
  }
}
