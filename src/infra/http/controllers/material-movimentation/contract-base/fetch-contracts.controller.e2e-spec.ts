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

describe("Fetch Contracts (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let jwt: JwtService;
  let userFactory: UserFactory;
  let contractFactory: ContractFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, ContractFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    jwt = moduleRef.get(JwtService);
    userFactory = moduleRef.get(UserFactory);
    contractFactory = moduleRef.get(ContractFactory);

    await app.init();
  });

  test("[GET] /contracts", async () => {
    const user = await userFactory.makeBqUser({});

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
      firstLogin: user.firstLogin,
    });
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
