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

describe("Transfer Material (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let jwt: JwtService;
  let userFactory: UserFactory;
  let projectFactory: ProjectFactory;
  let baseFactory: BaseFactory;
  let materialFactory: MaterialFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, MaterialFactory, BaseFactory, ProjectFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    jwt = moduleRef.get(JwtService);
    userFactory = moduleRef.get(UserFactory);
    materialFactory = moduleRef.get(MaterialFactory);
    baseFactory = moduleRef.get(BaseFactory);
    projectFactory = moduleRef.get(ProjectFactory);

    await app.init();
  });

  test("[POST] /movimentation", async () => {
    const base = await baseFactory.makeBqBase();
    const user = await userFactory.makeBqUser({
      baseId: base.id,
      type: "Almoxarife",
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
      .post("/movimentation")
      .set("Authorization", `Bearer ${accessToken}`)
      .send([
        {
          materialId: material.id.toString(),
          projectId: project.id.toString(),
          observation: "observação 1",
          value: 5,
        },
        {
          materialId: material.id.toString(),
          projectId: project.id.toString(),
          observation: "observação 2",
          value: 2,
        },
        {
          materialId: material.id.toString(),
          projectId: project.id.toString(),
          observation: "observação 3",
          value: -1,
        },
      ]);

    const movimentationDataBase = await bigquery.movimentation.select({
      where: { projectId: project.id.toString() },
    });

    expect(response.statusCode).toBe(201);
    expect(movimentationDataBase).toHaveLength(3);
  });
});
