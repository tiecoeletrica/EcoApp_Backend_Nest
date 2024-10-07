import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { ContractFactory } from "test/factories/make-contract";

describe("Register Base (E2E)", () => {
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

  test("[POST] /bases", async () => {
    const user = await userFactory.makeBqUser({});
    const contract = await contractFactory.makeBqContract({});

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
    });

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
