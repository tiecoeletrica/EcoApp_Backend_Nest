import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { ProjectFactory } from "test/factories/make-project";

describe("Identifier Attribution (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let jwt: JwtService;
  let userFactory: UserFactory;
  let projectFactory: ProjectFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, ProjectFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    jwt = moduleRef.get(JwtService);
    userFactory = moduleRef.get(UserFactory);
    projectFactory = moduleRef.get(ProjectFactory);

    await app.init();
  });

  test("[POST] /physical-documents", async () => {
    const user = await userFactory.makeBqUser({ type: "Almoxarife" });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
      firstLogin: user.firstLogin,
    });

    const project = await projectFactory.makeBqProject({ baseId: user.baseId });

    const response = await request(app.getHttpServer())
      .post("/physical-documents")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        project_number: project.project_number,
        identifier: 2,
      });

    const [physicalDocumentDataBase] = await bigquery.physicalDocument.select({
      where: { identifier: 2 },
    });

    expect(response.statusCode).toBe(201);
    expect(physicalDocumentDataBase.identifier).toEqual(2);
  });
});
