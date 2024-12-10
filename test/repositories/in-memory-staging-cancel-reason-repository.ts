import { StagingCancelReasonRepository } from "src/domain/material-movimentation/application/repositories/staging-cancel-reason-repository";
import { StagingCancelReason } from "src/domain/material-movimentation/enterprise/entities/staging-cancel-reason";

export class InMemoryStagingCancelReasonRepository
  implements StagingCancelReasonRepository
{
  public items: StagingCancelReason[] = [];

  constructor() {}

  async create(stagingCancelReasons: StagingCancelReason) {
    this.items.push(stagingCancelReasons);
  }
}
