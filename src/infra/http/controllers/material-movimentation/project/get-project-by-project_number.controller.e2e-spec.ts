import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { ContractFactory } from "test/factories/make-contract";
import { ProjectFactory } from "test/factories/make-project";
import { BaseFactory } from "test/factories/make-base";
import { AccessTokenCreator } from "test/access-token-creator";

describe("Fetch Movimentation History (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let userFactory: UserFactory;
  let accessTokenCreator: AccessTokenCreator;
  let contractFactory: ContractFactory;
  let projectFactory: ProjectFactory;
  let baseFactory: BaseFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        AccessTokenCreator,
        ContractFactory,
        BaseFactory,
        ProjectFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    userFactory = moduleRef.get(UserFactory);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    contractFactory = moduleRef.get(ContractFactory);
    projectFactory = moduleRef.get(ProjectFactory);
    baseFactory = moduleRef.get(BaseFactory);

    await app.init();
  });

  test("[GET] /projects", async () => {
    const contract = await contractFactory.makeBqContract();
    const base = await baseFactory.makeBqBase({ contractId: contract.id });
    const user = await userFactory.makeBqUser({
      contractId: contract.id,
      baseId: base.id,
    });

    const accessToken = accessTokenCreator.execute(user);

    await projectFactory.makeBqProject({
      project_number: "B-TEST-PROJECT",
      baseId: base.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/projects?project_number=B-TEST-PROJECT`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      project: expect.objectContaining({
        project_number: "B-TEST-PROJECT",
      }),
    });
  });
});
