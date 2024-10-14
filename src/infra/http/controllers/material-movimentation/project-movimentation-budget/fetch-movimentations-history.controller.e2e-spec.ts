import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { MovimentationFactory } from "test/factories/make-movimentation";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { DatabaseModule } from "src/infra/database/database.module";
import { MaterialFactory } from "test/factories/make-material";
import { ContractFactory } from "test/factories/make-contract";
import { ProjectFactory } from "test/factories/make-project";
import { BaseFactory } from "test/factories/make-base";

describe("Fetch Movimentation History (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let jwt: JwtService;
  let userFactory: UserFactory;
  let movimentationFactory: MovimentationFactory;
  let materialFactory: MaterialFactory;
  let contractFactory: ContractFactory;
  let projectFactory: ProjectFactory;
  let baseFactory: BaseFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        MovimentationFactory,
        MaterialFactory,
        ContractFactory,
        BaseFactory,
        ProjectFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    jwt = moduleRef.get(JwtService);
    userFactory = moduleRef.get(UserFactory);
    movimentationFactory = moduleRef.get(MovimentationFactory);
    materialFactory = moduleRef.get(MaterialFactory);
    contractFactory = moduleRef.get(ContractFactory);
    projectFactory = moduleRef.get(ProjectFactory);
    baseFactory = moduleRef.get(BaseFactory);

    await app.init();
  });

  test("[GET] /movimentations", async () => {
    const contract = await contractFactory.makeBqContract();
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
    const project = await projectFactory.makeBqProject({ baseId: base.id });

    const material1 = await materialFactory.makeBqMaterial(
      { contractId: contract.id },
      new UniqueEntityID("material1")
    );
    const material2 = await materialFactory.makeBqMaterial(
      { contractId: contract.id },
      new UniqueEntityID("material2")
    );
    const material3 = await materialFactory.makeBqMaterial(
      { contractId: contract.id },
      new UniqueEntityID("material3")
    );

    await movimentationFactory.makeBqMovimentation({
      materialId: material1.id,
      baseId: base.id,
      projectId: project.id,
      storekeeperId: user.id,
    });

    await movimentationFactory.makeBqMovimentation({
      materialId: material2.id,
      baseId: base.id,
      projectId: project.id,
      storekeeperId: user.id,
    });

    await movimentationFactory.makeBqMovimentation({
      materialId: material3.id,
      baseId: base.id,
      projectId: project.id,
      storekeeperId: user.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/movimentations`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      movimentations: expect.arrayContaining([
        expect.objectContaining({
          material: expect.objectContaining({ id: "material1" }),
        }),
        expect.objectContaining({
          material: expect.objectContaining({ id: "material2" }),
        }),
        expect.objectContaining({
          material: expect.objectContaining({ id: "material3" }),
        }),
      ]),
      pagination: expect.objectContaining({
        lastPage: 1,
        page: 1,
        pageCount: 40,
      }),
    });
  });
});
