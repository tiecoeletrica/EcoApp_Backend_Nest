import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { makeBase } from "test/factories/make-base";

describe("Fetch Accounts (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let jwt: JwtService;
  let userFactory: UserFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    jwt = moduleRef.get(JwtService);
    userFactory = moduleRef.get(UserFactory);

    await app.init();
  });

  test("[GET] /accounts", async () => {
    const base = makeBase();

    const user = await userFactory.makeBqUser({
      name: "rodrigo",
      baseId: base.id,
      type: "Administrador",
    });
    await userFactory.makeBqUser({
      name: "max",
      baseId: base.id,
    });
    await userFactory.makeBqUser({
      name: "rafael",
      baseId: base.id,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
      firstLogin: user.firstLogin,
    });

    const response = await request(app.getHttpServer())
      .get(`/accounts?baseId=${base.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      users: expect.arrayContaining([
        expect.objectContaining({ name: "rodrigo" }),
        expect.objectContaining({ name: "rafael" }),
        expect.objectContaining({ name: "max" }),
      ]),
      pagination: expect.objectContaining({
        lastPage: 1,
        page: 1,
        pageCount: 40,
      }),
    });
  });
});
