import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { hash } from "bcryptjs";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { AccessTokenCreator } from "test/access-token-creator";

describe("Authenticate (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let userFactory: UserFactory;
  let accessTokenCreator: AccessTokenCreator;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, AccessTokenCreator],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    userFactory = moduleRef.get(UserFactory);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);

    await app.init();
  });

  test("[POST] /sessions", async () => {
    await userFactory.makeBqUser({
      email: "joaopilotinha@ecoeletrica.com.br",
      password: await hash("123456", 8),
      status: "ativo",
    });

    const response = await request(app.getHttpServer()).post("/sessions").send({
      email: "joaopilotinha@ecoeletrica.com.br",
      password: "123456",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ access_token: expect.any(String) });
  });
});
