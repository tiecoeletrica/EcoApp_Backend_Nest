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

describe("Edit account (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let jwt: JwtService;
  let userFactory: UserFactory;
  let baseFactory: BaseFactory;
  let contractFactory: ContractFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [BaseFactory, ContractFactory, UserFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    jwt = moduleRef.get(JwtService);
    userFactory = moduleRef.get(UserFactory);
    baseFactory = moduleRef.get(BaseFactory);
    contractFactory = moduleRef.get(ContractFactory);

    await app.init();
  });

  test("[PUT] /accounts:id - storekeeper", async () => {
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
      firstLogin: user.firstLogin,
    });

    const response = await request(app.getHttpServer())
      .put(`/accounts/${user.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        password: "123456",
        type: "Administrador",
        baseId: base.id.toString(),
      });

    const [userDataBase] = await bigquery.user.select({
      where: { email: user.email },
    });

    expect(response.statusCode).toBe(201);
    expect(userDataBase.baseId).toEqual(base.id.toString());
  });

  test("[PUT] /accounts:id - estimator", async () => {
    const contract = await contractFactory.makeBqContract();
    const base = await baseFactory.makeBqBase({ contractId: contract.id });
    const user = await userFactory.makeBqUser({
      type: "Orçamentista",
      baseId: base.id,
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
      .put(`/accounts/${user.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        password: "123456",
        contractId: contract.id.toString(),
      });

    const [userDataBase] = await bigquery.user.select({
      where: { email: user.email },
    });

    expect(response.statusCode).toBe(201);
    expect(userDataBase.contractId).toEqual(contract.id.toString());
  });
});
