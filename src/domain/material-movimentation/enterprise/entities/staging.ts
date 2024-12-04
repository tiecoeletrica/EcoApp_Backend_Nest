import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface StagingProps {
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
  stageFerragem: "AGUARDANDO SEPARAÇÃO" | "EM SEPARAÇÃO" | "AGUARDANDO SAQUE"  | "OK" | "CANCELADO" | "IMPROCEDENTE"
  stageConcreto: "AGUARDANDO RETIRADA" /**saque */ | "AGUARDANDO PROGRAMAÇÃO" /**carreta */ | "PROGRAMADO" /**carreta */ |  "OK" | "CANCELADO" | "IMPROCEDENTE"
}
