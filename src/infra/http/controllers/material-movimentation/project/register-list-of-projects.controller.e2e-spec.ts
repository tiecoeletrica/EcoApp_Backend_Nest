import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { BaseFactory } from "test/factories/make-base";

describe("Register Project Bulk (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let jwt: JwtService;
  let userFactory: UserFactory;
  let baseFactory: BaseFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, BaseFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    jwt = moduleRef.get(JwtService);
    userFactory = moduleRef.get(UserFactory);
    baseFactory = moduleRef.get(BaseFactory);

    await app.init();
  });

  test("[POST] /projects-bulk", async () => {
    const base = await baseFactory.makeBqBase({ baseName: "Base 1" });

    const user = await userFactory.makeBqUser({
      baseId: base.id,
      type: "Administrador",
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
      firstLogin: user.firstLogin,
    });

    const response = await request(app.getHttpServer())
      .post("/projects-bulk")
      .set("Authorization", `Bearer ${accessToken}`)
      .send([
        {
          project_number: "B-12345678",
          description: "MP-NUM-SEI-DAS-QUANTAS",
          type: "obra",
          baseName: "Base 1",
          city: "Ituí",
        },
        {
          project_number: "B-1234567",
          description: "MP-NUM-SEI-DAS-QUANTAS",
          type: "obra",
          baseName: "Base 1",
          city: "Ituí",
        },
      ]);

    console.log(response.headers);
    console.log(response.body);
    console.log(response.text);
    console.log(response.error);

    const projectDataBase = await bigquery.project.select({
      whereIn: { project_number: ["B-12345678", "B-1234567"] },
    });

    expect(response.statusCode).toBe(201);
    expect(projectDataBase.length).toEqual(2);
  });
});
