import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { BaseFactory } from "test/factories/make-base";
import { DatabaseModule } from "src/infra/database/database.module";
import { AccessTokenCreator } from "test/access-token-creator";

describe("Fetch Bases (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let userFactory: UserFactory;
  let accessTokenCreator: AccessTokenCreator;
  let baseFactory: BaseFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, AccessTokenCreator, BaseFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    userFactory = moduleRef.get(UserFactory);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    baseFactory = moduleRef.get(BaseFactory);

    await app.init();
  });

  test("[GET] /bases", async () => {
    const user = await userFactory.makeBqUser({});

    const accessToken = accessTokenCreator.execute(user);

    await baseFactory.makeBqBase({});
    await baseFactory.makeBqBase({});
    await baseFactory.makeBqBase({});

    const response = await request(app.getHttpServer())
      .get("/bases")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(response.statusCode).toBe(200);
    expect(response.body.bases).toHaveLength(3);
  });
});
