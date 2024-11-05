import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { MovimentationFactory } from "test/factories/make-movimentation";
import { DatabaseModule } from "src/infra/database/database.module";
import { ProjectFactory } from "test/factories/make-project";
import { BudgetFactory } from "test/factories/make-budget";
import { ContractFactory } from "test/factories/make-contract";
import { BaseFactory } from "test/factories/make-base";
import { MaterialFactory } from "test/factories/make-material";
import { AccessTokenCreator } from "test/access-token-creator";

describe("Fetch Movimentation and Budget By Project Name (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let userFactory: UserFactory;
  let accessTokenCreator: AccessTokenCreator;
  let movimentationFactory: MovimentationFactory;
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
        MovimentationFactory,
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
    movimentationFactory = moduleRef.get(MovimentationFactory);
    budgetFactory = moduleRef.get(BudgetFactory);
    projectFactory = moduleRef.get(ProjectFactory);
    baseFactory = moduleRef.get(BaseFactory);
    contractFactory = moduleRef.get(ContractFactory);
    materialFactory = moduleRef.get(MaterialFactory);

    await app.init();
  });

  test("[GET] /movimentations/budgets", async () => {
    const contract = await contractFactory.makeBqContract({});
    const base = await baseFactory.makeBqBase({ contractId: contract.id });

    const user = await userFactory.makeBqUser({
      baseId: base.id,
      type: "Almoxarife",
    });

    const material1 = await materialFactory.makeBqMaterial({
      code: 1,
      contractId: contract.id,
    });
    const material2 = await materialFactory.makeBqMaterial({
      code: 2,
      contractId: contract.id,
    });
    const material3 = await materialFactory.makeBqMaterial({
      code: 3,
      contractId: contract.id,
    });

    const accessToken = accessTokenCreator.execute(user);

    const project = await projectFactory.makeBqProject({
      project_number: "B-teste",
      baseId: base.id,
    });

    await movimentationFactory.makeBqMovimentation({
      projectId: project.id,
      baseId: base.id,
      storekeeperId: user.id,
      materialId: material1.id,
    });

    await movimentationFactory.makeBqMovimentation({
      projectId: project.id,
      baseId: base.id,
      storekeeperId: user.id,
      materialId: material2.id,
    });

    await budgetFactory.makeBqBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material1.id,
    });
    await budgetFactory.makeBqBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material2.id,
    });
    await budgetFactory.makeBqBudget({
      projectId: project.id,
      contractId: contract.id,
      materialId: material3.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/movimentations-budgets?project_number=${project.project_number}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body.movimentations).toHaveLength(2);
    expect(response.body.movimentations).toEqual([
      expect.objectContaining({
        material: expect.objectContaining({ code: 1 }),
      }),
      expect.objectContaining({
        material: expect.objectContaining({ code: 2 }),
      }),
    ]);
    expect(response.body.budgets).toHaveLength(3);
    expect(response.body.budgets).toEqual([
      expect.objectContaining({
        material: expect.objectContaining({ code: 1 }),
      }),
      expect.objectContaining({
        material: expect.objectContaining({ code: 2 }),
      }),
      expect.objectContaining({
        material: expect.objectContaining({ code: 3 }),
      }),
    ]);
  });
});
