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

describe("Create Material (E2E)", () => {
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

  test("[POST] /materials - unique material", async () => {
    const contract = await contractFactory.makeBqContract({});
    const user = await userFactory.makeBqUser({
      type: "Administrador",
      contractId: contract.id,
    });

    const accessToken = accessTokenCreator.execute(user);

    const response = await request(app.getHttpServer())
      .post("/materials")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        code: 123132,
        description: "material de teste",
        type: "concreto",
        unit: "CDA",
      });

    const [MaterialDataBase] = await bigquery.material.select({
      where: { code: 123132 },
    });

    expect(response.statusCode).toBe(201);
    expect(MaterialDataBase.description).toEqual("MATERIAL DE TESTE");
  });
});
