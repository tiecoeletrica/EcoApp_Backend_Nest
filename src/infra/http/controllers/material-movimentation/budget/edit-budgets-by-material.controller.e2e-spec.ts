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
import { BudgetFactory } from "test/factories/make-budget";
import { AccessTokenCreator } from "test/access-token-creator";

describe("Edit Budgets by Material (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let userFactory: UserFactory;
  let accessTokenCreator: AccessTokenCreator;
  let projectFactory: ProjectFactory;
  let baseFactory: BaseFactory;
  let materialFactory: MaterialFactory;
  let contractFactory: ContractFactory;
  let budgetFactory: BudgetFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        AccessTokenCreator,
        MaterialFactory,
        BaseFactory,
        ProjectFactory,
        ContractFactory,
        BudgetFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    userFactory = moduleRef.get(UserFactory);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    materialFactory = moduleRef.get(MaterialFactory);
    baseFactory = moduleRef.get(BaseFactory);
    projectFactory = moduleRef.get(ProjectFactory);
    contractFactory = moduleRef.get(ContractFactory);
    budgetFactory = moduleRef.get(BudgetFactory);

    await app.init();
  });

  test("[PUT] /budgets-materials", async () => {
    const contract = await contractFactory.makeBqContract();
    const base = await baseFactory.makeBqBase({ contractId: contract.id });
    const user = await userFactory.makeBqUser({
      baseId: base.id,
      contractId: contract.id,
      type: "Orçamentista",
    });

    const accessToken = accessTokenCreator.execute(user);

    const project1 = await projectFactory.makeBqProject({
      project_number: "B-test-1",
      baseId: base.id,
    });
    const project2 = await projectFactory.makeBqProject({
      project_number: "B-test-2",
      baseId: base.id,
    });

    const material1 = await materialFactory.makeBqMaterial({
      code: 123456,
      contractId: contract.id,
    });
    const material2 = await materialFactory.makeBqMaterial({
      code: 654321,
      contractId: contract.id,
    });

    await budgetFactory.makeBqBudget({
      materialId: material1.id,
      estimatorId: user.id,
      projectId: project1.id,
      contractId: user.contractId,
      value: 5,
    });

    await budgetFactory.makeBqBudget({
      materialId: material1.id,
      estimatorId: user.id,
      projectId: project2.id,
      contractId: user.contractId,
      value: 3,
    });

    const response = await request(app.getHttpServer())
      .put(`/budgets-materials`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        project_numbers: ["B-test-1", "B-test-2"],
        codeFrom: 123456,
        codeTo: 654321,
        multiplier: 1.5,
      });

    const budgetDataBase = await bigquery.budget.select();

    expect(response.statusCode).toBe(201);
    expect(budgetDataBase).toHaveLength(4);
    expect(budgetDataBase).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          projectId: project1.id.toString(),
          materialId: material1.id.toString(),
          value: 0,
        }),
        expect.objectContaining({
          projectId: project2.id.toString(),
          materialId: material1.id.toString(),
          value: 0,
        }),
        expect.objectContaining({
          projectId: project1.id.toString(),
          materialId: material2.id.toString(),
          value: 7.5,
        }),
        expect.objectContaining({
          projectId: project2.id.toString(),
          materialId: material2.id.toString(),
          value: 4.5,
        }),
      ])
    );
  });
});
