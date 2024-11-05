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
import { AccessTokenCreator } from "test/access-token-creator";

describe("Create account (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let userFactory: UserFactory;
  let accessTokenCreator: AccessTokenCreator;
  let baseFactory: BaseFactory;
  let contractFactory: ContractFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        AccessTokenCreator,
        BaseFactory,
        ContractFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    userFactory = moduleRef.get(UserFactory);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
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

    const accessToken = accessTokenCreator.execute(user);

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
