import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { MaterialFactory } from "test/factories/make-material";
import { DatabaseModule } from "src/infra/database/database.module";
import { ContractFactory } from "test/factories/make-contract";
import { AccessTokenCreator } from "test/access-token-creator";

describe("Fetch Materials (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let userFactory: UserFactory;
  let accessTokenCreator: AccessTokenCreator;
  let materialFactory: MaterialFactory;
  let contractFactory: ContractFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        AccessTokenCreator,
        MaterialFactory,
        ContractFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    userFactory = moduleRef.get(UserFactory);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    materialFactory = moduleRef.get(MaterialFactory);
    contractFactory = moduleRef.get(ContractFactory);

    await app.init();
  });

  test("[GET] /materials", async () => {
    const contract = await contractFactory.makeBqContract({});
    const user = await userFactory.makeBqUser({
      contractId: contract.id,
    });

    const accessToken = accessTokenCreator.execute(user);

    await materialFactory.makeBqMaterial({
      code: 123132,
      type: "concreto",
      contractId: contract.id,
    });

    await materialFactory.makeBqMaterial({
      code: 123133,
      type: "concreto",
      contractId: contract.id,
    });

    await materialFactory.makeBqMaterial({
      code: 123134,
      type: "concreto",
      contractId: contract.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/materials?contractId=${contract.id.toString()}&type=concreto`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      materials: [
        expect.objectContaining({ code: 123132 }),
        expect.objectContaining({ code: 123133 }),
        expect.objectContaining({ code: 123134 }),
      ],
      pagination: {
        page: 1,
        pageCount: 40,
        lastPage: 1,
      },
    });
  });
});
