import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { AccessTokenCreator } from "test/access-token-creator";

describe("Delete Account (E2E)", () => {
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

  test("[DELETE] /accounts:id", async () => {
    const user = await userFactory.makeBqUser({
      type: "Administrador",
    });
    const userToDelete = await userFactory.makeBqUser({
      name: "Joao Excluido",
    });

    const accessToken = accessTokenCreator.execute(user);

    const response = await request(app.getHttpServer())
      .delete(`/accounts/${userToDelete.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    const search = await bigquery.user.select({
      where: { name: "Joao Excluido" },
    });

    expect(response.statusCode).toBe(201);
    expect(search).toHaveLength(0);
  });
});
