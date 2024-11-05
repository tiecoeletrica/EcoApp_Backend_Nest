import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { ContractFactory } from "test/factories/make-contract";
import { AccessTokenCreator } from "test/access-token-creator";

describe("Register Base (E2E)", () => {
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

  test("[POST] /bases", async () => {
    const user = await userFactory.makeBqUser({ type: "Administrador" });
    const contract = await contractFactory.makeBqContract({});

    const accessToken = accessTokenCreator.execute(user);

    const response = await request(app.getHttpServer())
      .post("/bases")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        baseName: "Base Teste",
        contractId: contract.id.toString(),
      });

    const [baseDataBase] = await bigquery.base.select({
      where: { contractId: contract.id.toString() },
    });

    expect(response.statusCode).toBe(201);
    expect(baseDataBase.baseName).toEqual("Base Teste");
  });
});
