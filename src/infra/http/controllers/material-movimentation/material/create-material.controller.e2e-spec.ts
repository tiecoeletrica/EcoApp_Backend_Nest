import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { ContractFactory } from "test/factories/make-contract";

describe("Create Material (E2E)", () => {
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

  test("[POST] /materials - unique material", async () => {
    const contract = await contractFactory.makeBqContract({});
    const user = await userFactory.makeBqUser({
      type: "Administrador",
      contractId: contract.id,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
      firstLogin: user.firstLogin,
    });

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

  test("[POST] /materials - array of materials", async () => {
    const contract = await contractFactory.makeBqContract({});
    const user = await userFactory.makeBqUser({
      contractId: contract.id,
      type: "Administrador",
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
      firstLogin: user.firstLogin,
    });

    const response = await request(app.getHttpServer())
      .post("/materials")
      .set("Authorization", `Bearer ${accessToken}`)
      .send([
        {
          code: 123131,
          description: "material de teste",
          type: "concreto",
          unit: "CDA",
        },
        {
          code: 123133,
          description: "material de teste",
          type: "equipamento",
          unit: "CDA",
        },
      ]);

    const MaterialDataBase = await bigquery.material.select({
      whereIn: { code: [123133, 123131] },
    });

    expect(response.statusCode).toBe(201);
    expect(MaterialDataBase).toHaveLength(2);
  });
});
