import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { ProjectFactory } from "test/factories/make-project";
import { BudgetFactory } from "test/factories/make-budget";
import { ContractFactory } from "test/factories/make-contract";
import { BaseFactory } from "test/factories/make-base";
import { MaterialFactory } from "test/factories/make-material";

describe("Fetch exsinting budgets by projectIds (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let jwt: JwtService;
  let userFactory: UserFactory;
  let projectFactory: ProjectFactory;
  let budgetFactory: BudgetFactory;
  let contractFactory: ContractFactory;
  let baseFactory: BaseFactory;
  let materialFactory: MaterialFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        BudgetFactory,
        ProjectFactory,
        BaseFactory,
        ContractFactory,
        MaterialFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    jwt = moduleRef.get(JwtService);
    userFactory = moduleRef.get(UserFactory);
    budgetFactory = moduleRef.get(BudgetFactory);
    projectFactory = moduleRef.get(ProjectFactory);
    baseFactory = moduleRef.get(BaseFactory);
    contractFactory = moduleRef.get(ContractFactory);
    materialFactory = moduleRef.get(MaterialFactory);

    await app.init();
  });

  test("[POST] /fetch-existing-budgets", async () => {
    const contract = await contractFactory.makeBqContract({});
    const base = await baseFactory.makeBqBase({ contractId: contract.id });

    const user = await userFactory.makeBqUser({
      baseId: base.id,
      contractId: contract.id,
      type: "Orçamentista"
    });

    const material = await materialFactory.makeBqMaterial({
      contractId: contract.id,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
    });

    const project1 = await projectFactory.makeBqProject({
      baseId: base.id,
    });

    const project2 = await projectFactory.makeBqProject({
      baseId: base.id,
    });

    const project3 = await projectFactory.makeBqProject({
      baseId: base.id,
    });

    await budgetFactory.makeBqBudget({
      projectId: project1.id,
      contractId: contract.id,
      estimatorId: user.id,
      materialId: material.id,
    });
    await budgetFactory.makeBqBudget({
      projectId: project2.id,
      contractId: contract.id,
      estimatorId: user.id,
      materialId: material.id,
    });
    await budgetFactory.makeBqBudget({
      projectId: project2.id,
      contractId: contract.id,
      estimatorId: user.id,
      materialId: material.id,
    });
    await budgetFactory.makeBqBudget({
      projectId: project3.id,
      contractId: contract.id,
      estimatorId: user.id,
      materialId: material.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/fetch-existing-budgets`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        projectIds: [project1.id.toString(), project2.id.toString()],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.budgets).toHaveLength(3);
  });
});
