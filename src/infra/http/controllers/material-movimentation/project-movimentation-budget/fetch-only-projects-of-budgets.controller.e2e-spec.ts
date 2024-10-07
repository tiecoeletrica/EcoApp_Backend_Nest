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

describe("Fetch only Projects of Budget By Project Name (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let jwt: JwtService;
  let userFactory: UserFactory;
  let projectFactory: ProjectFactory;
  let budgetFactory: BudgetFactory;
  let contractFactory: ContractFactory;
  let baseFactory: BaseFactory;

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

    await app.init();
  });

  test("[POST] /budgets-only-projects", async () => {
    const contract = await contractFactory.makeBqContract({});
    const base = await baseFactory.makeBqBase({ contractId: contract.id });

    const user = await userFactory.makeBqUser({
      baseId: base.id,
      contractId: contract.id,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
    });

    const project1 = await projectFactory.makeBqProject({
      project_number: "B-123456",
      baseId: base.id,
    });

    const project2 = await projectFactory.makeBqProject({
      project_number: "B-1234567",
      baseId: base.id,
    });

    const project3 = await projectFactory.makeBqProject({
      project_number: "B-12345678",
      baseId: base.id,
    });

    await budgetFactory.makeBqBudget({
      projectId: project1.id,
      contractId: contract.id,
    });
    await budgetFactory.makeBqBudget({
      projectId: project2.id,
      contractId: contract.id,
    });
    await budgetFactory.makeBqBudget({
      projectId: project2.id,
      contractId: contract.id,
    });
    await budgetFactory.makeBqBudget({
      projectId: project3.id,
      contractId: contract.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/budgets-only-projects`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        project_numbers: ["B-123456", "B-1234567"],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.foundProjects).toHaveLength(2);
    expect(response.body.foundProjects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: project1.id.toString(),
          project_number: "B-123456",
        }),
        expect.objectContaining({
          id: project2.id.toString(),
          project_number: "B-1234567",
        }),
      ])
    );
  });
});
