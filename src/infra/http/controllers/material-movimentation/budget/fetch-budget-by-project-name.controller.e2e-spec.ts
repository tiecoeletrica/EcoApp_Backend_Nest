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
import { AccessTokenCreator } from "test/access-token-creator";

describe("Fetch and Budget By Project Name (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let userFactory: UserFactory;
  let accessTokenCreator: AccessTokenCreator;
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
        AccessTokenCreator,
        BudgetFactory,
        ProjectFactory,
        BaseFactory,
        ContractFactory,
        MaterialFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    userFactory = moduleRef.get(UserFactory);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    budgetFactory = moduleRef.get(BudgetFactory);
    projectFactory = moduleRef.get(ProjectFactory);
    baseFactory = moduleRef.get(BaseFactory);
    contractFactory = moduleRef.get(ContractFactory);
    materialFactory = moduleRef.get(MaterialFactory);

    await app.init();
  });

  test("[GET] /budgets", async () => {
    const contract = await contractFactory.makeBqContract({});
    const base = await baseFactory.makeBqBase({ contractId: contract.id });

    const user = await userFactory.makeBqUser({
      baseId: base.id,
      contractId: contract.id,
      type: "Orçamentista"
    });

    const accessToken = accessTokenCreator.execute(user);

    const material = await materialFactory.makeBqMaterial({
      contractId: contract.id,
    });

    const project = await projectFactory.makeBqProject({
      project_number: "B-TESTE",
      baseId: base.id,
    });

    await budgetFactory.makeBqBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material.id,
    });
    await budgetFactory.makeBqBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material.id,
    });
    await budgetFactory.makeBqBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/budgets?project_number=${project.project_number}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body.budgets).toHaveLength(3);
  });
});
