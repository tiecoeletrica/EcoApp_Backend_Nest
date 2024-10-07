import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { ProjectFactory } from "test/factories/make-project";
import { BaseFactory } from "test/factories/make-base";
import { MaterialFactory } from "test/factories/make-material";
import { ContractFactory } from "test/factories/make-contract";

describe("Register Budget (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let jwt: JwtService;
  let userFactory: UserFactory;
  let projectFactory: ProjectFactory;
  let baseFactory: BaseFactory;
  let materialFactory: MaterialFactory;
  let contractFactory: ContractFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        MaterialFactory,
        BaseFactory,
        ProjectFactory,
        ContractFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    jwt = moduleRef.get(JwtService);
    userFactory = moduleRef.get(UserFactory);
    materialFactory = moduleRef.get(MaterialFactory);
    baseFactory = moduleRef.get(BaseFactory);
    projectFactory = moduleRef.get(ProjectFactory);
    contractFactory = moduleRef.get(ContractFactory);

    await app.init();
  });

  test("[POST] /budgets", async () => {
    const contract = await contractFactory.makeBqContract();
    const base = await baseFactory.makeBqBase({ contractId: contract.id });
    const user = await userFactory.makeBqUser({
      baseId: base.id,
      contractId: contract.id,
      type: "Orçamentista",
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
    });

    const project = await projectFactory.makeBqProject();
    const material = await materialFactory.makeBqMaterial();

    const response = await request(app.getHttpServer())
      .post("/budgets")
      .set("Authorization", `Bearer ${accessToken}`)
      .send([
        {
          materialId: material.id.toString(),
          projectId: project.id.toString(),
          value: 5,
        },
        {
          materialId: material.id.toString(),
          projectId: project.id.toString(),
          value: 2,
        },
        {
          materialId: material.id.toString(),
          projectId: project.id.toString(),
          value: 8,
        },
      ]);

    const budgetDataBase = await bigquery.budget.select({
      where: { projectId: project.id.toString() },
    });

    expect(response.statusCode).toBe(201);
    expect(budgetDataBase).toHaveLength(3);
  });
});
