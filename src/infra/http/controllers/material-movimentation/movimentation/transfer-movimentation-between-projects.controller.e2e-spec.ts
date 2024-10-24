import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { MovimentationFactory } from "test/factories/make-movimentation";
import { BqMovimentationProps } from "src/infra/database/bigquery/schemas/movimentation";
import { ProjectFactory } from "test/factories/make-project";
import { BaseFactory } from "test/factories/make-base";
import { MaterialFactory } from "test/factories/make-material";

describe("Transfer Movimentation Between Projects (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let jwt: JwtService;
  let userFactory: UserFactory;
  let movimentationFactory: MovimentationFactory;
  let projectFactory: ProjectFactory;
  let baseFactory: BaseFactory;
  let materialFactory: MaterialFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        MovimentationFactory,
        MaterialFactory,
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
    baseFactory = moduleRef.get(BaseFactory);
    projectFactory = moduleRef.get(ProjectFactory);

    await app.init();
  });

  test("[POST] /transfer-movimentation", async () => {
    const base = await baseFactory.makeBqBase();
    const user = await userFactory.makeBqUser({
      type: "Almoxarife",
      baseId: base.id,
    });
    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
    });

    const projectOut = await projectFactory.makeBqProject();
    const projectIn = await projectFactory.makeBqProject();
    const material1 = await materialFactory.makeBqMaterial();
    const material2 = await materialFactory.makeBqMaterial();
    const material3 = await materialFactory.makeBqMaterial();

    await movimentationFactory.makeBqMovimentation({
      projectId: projectOut.id,
      materialId: material1.id,
      baseId: base.id,
      value: 5,
    });

    await movimentationFactory.makeBqMovimentation({
      projectId: projectOut.id,
      materialId: material2.id,
      baseId: base.id,
      value: 6,
    });

    await movimentationFactory.makeBqMovimentation({
      projectId: projectOut.id,
      materialId: material3.id,
      baseId: base.id,
      value: 10,
    });

    const response = await request(app.getHttpServer())
      .post("/transfer-movimentation")
      .set("Authorization", `Bearer ${accessToken}`)
      .send([
        {
          materialId: material1.id.toString(),
          projectIdOut: projectOut.id.toString(),
          projectIdIn: projectIn.id.toString(),
          observation: "observação 1",
          baseId: base.id.toString(),
          value: 4,
        },
        {
          materialId: material2.id.toString(),
          projectIdOut: projectOut.id.toString(),
          projectIdIn: projectIn.id.toString(),
          observation: "observação 2",
          baseId: base.id.toString(),
          value: 6,
        },
        {
          materialId: material3.id.toString(),
          projectIdOut: projectOut.id.toString(),
          projectIdIn: projectIn.id.toString(),
          observation: "observação 3",
          baseId: base.id.toString(),
          value: 8,
        },
      ]);

    let movimentationDataBaseOut = await bigquery.movimentation.select({
      where: { projectId: projectOut.id.toString() },
    });
    const movimentationDataBaseIn = await bigquery.movimentation.select({
      where: { projectId: projectIn.id.toString() },
    });

    movimentationDataBaseOut = movimentationDataBaseOut.reduce((a, b) => {
      const existingMaterial = a.find(
        (item) => item.materialId === b.materialId
      );

      if (existingMaterial) {
        existingMaterial.value += b.value;
      } else {
        a.push({ ...b });
      }

      return a;
    }, [] as BqMovimentationProps[]);

    expect(response.statusCode).toBe(201);
    expect(movimentationDataBaseOut).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          materialId: material1.id.toString(),
          value: 1,
        }),
        expect.objectContaining({
          materialId: material2.id.toString(),
          value: 0,
        }),
        expect.objectContaining({
          materialId: material3.id.toString(),
          value: 2,
        }),
      ])
    );
    expect(movimentationDataBaseIn).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          materialId: material1.id.toString(),
          value: 4,
        }),
        expect.objectContaining({
          materialId: material2.id.toString(),
          value: 6,
        }),
        expect.objectContaining({
          materialId: material3.id.toString(),
          value: 8,
        }),
      ])
    );
  });
});
