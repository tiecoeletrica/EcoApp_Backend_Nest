import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { BaseFactory } from "test/factories/make-base";
import { ContractFactory } from "test/factories/make-contract";

describe("Create account (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let jwt: JwtService;
  let userFactory: UserFactory;
  let baseFactory: BaseFactory;
  let contractFactory: ContractFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, BaseFactory, ContractFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    jwt = moduleRef.get(JwtService);
    userFactory = moduleRef.get(UserFactory);
    baseFactory = moduleRef.get(BaseFactory);
    contractFactory = moduleRef.get(ContractFactory);

    await app.init();
  });

  test("[POST] /accounts", async () => {
    const contract = await contractFactory.makeBqContract();
    const base = await baseFactory.makeBqBase({ contractId: contract.id });

    const user = await userFactory.makeBqUser({
      type: "Administrador",
      baseId: base.id,
      contractId: contract.id,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
    });

    const response = await request(app.getHttpServer())
      .post("/accounts")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Joao da Pilotinha",
        email: "joaopilotinha@ecoeletrica.com.br",
        password: "123456",
        cpf: "00011122234",
        status: "ativo",
        type: "Administrador",
        baseId: base.id.toString(),
        contractId: contract.id.toString(),
      });

    const [userDataBase] = await bigquery.user.select({
      where: { email: "joaopilotinha@ecoeletrica.com.br" },
    });

    expect(response.statusCode).toBe(201);
    expect(userDataBase.name).toEqual("Joao da Pilotinha");
  });
});
