import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { AccessTokenCreator } from "test/access-token-creator";

describe("Register Contract (E2E)", () => {
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

  test("[POST] /contracts", async () => {
    const user = await userFactory.makeBqUser({ type: "Administrador" });

    const accessToken = accessTokenCreator.execute(user);

    const response = await request(app.getHttpServer())
      .post("/contracts")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        contractName: "Contrato numero 1",
      });

    const [contractDataBase] = await bigquery.contract.select({
      where: { contractName: "Contrato numero 1" },
    });

    expect(response.statusCode).toBe(201);
    expect(contractDataBase.contractName).toEqual("Contrato numero 1");
  });
});
