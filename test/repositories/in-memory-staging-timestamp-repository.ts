import { StagingTimestampRepository } from "src/domain/material-movimentation/application/repositories/staging-timestamp-repository";
import { StagingTimestamp } from "src/domain/material-movimentation/enterprise/entities/staging-timestamp";

export class InMemoryStagingTimestampRepository
  implements StagingTimestampRepository
{
  public items: StagingTimestamp[] = [];

  constructor() {}

  async create(stagingTimestamps: StagingTimestamp) {
    this.items.push(stagingTimestamps);
  }
}
