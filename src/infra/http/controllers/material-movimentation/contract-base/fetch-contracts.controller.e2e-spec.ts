import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";
import { UserFactory } from "test/factories/make-user";
import { ContractFactory } from "test/factories/make-contract";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { DatabaseModule } from "src/infra/database/database.module";
import { AccessTokenCreator } from "test/access-token-creator";

describe("Fetch Contracts (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let userFactory: UserFactory;
  let accessTokenCreator: AccessTokenCreator;
  let contractFactory: ContractFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, AccessTokenCreator, ContractFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    userFactory = moduleRef.get(UserFactory);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    contractFactory = moduleRef.get(ContractFactory);

    await app.init();
  });

  test("[GET] /contracts", async () => {
    const user = await userFactory.makeBqUser({});

    const accessToken = accessTokenCreator.execute(user);
    const contractId = randomUUID();

    await contractFactory.makeBqContract({});
    await contractFactory.makeBqContract({});
    await contractFactory.makeBqContract({});

    const response = await request(app.getHttpServer())
      .get("/contracts")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ contractId, type: "concreto" });

    expect(response.statusCode).toBe(200);
    expect(response.body.contracts).toHaveLength(3);
  });
});
