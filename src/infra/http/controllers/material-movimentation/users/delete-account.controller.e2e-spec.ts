import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";

describe("Delete Account (E2E)", () => {
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

  test("[DELETE] /accounts:id", async () => {
    const user = await userFactory.makeBqUser({
      type: "Administrador",
    });
    const userToDelete = await userFactory.makeBqUser({
      name: "Joao Excluido",
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
    });

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
