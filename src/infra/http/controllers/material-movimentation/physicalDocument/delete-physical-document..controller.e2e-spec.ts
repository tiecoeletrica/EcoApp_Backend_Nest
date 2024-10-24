import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { PhysicalDocumentFactory } from "test/factories/make-physical-document";

describe("Delete Physical Document (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let jwt: JwtService;
  let userFactory: UserFactory;
  let physicalDocumentFactory: PhysicalDocumentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, PhysicalDocumentFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    jwt = moduleRef.get(JwtService);
    userFactory = moduleRef.get(UserFactory);
    physicalDocumentFactory = moduleRef.get(PhysicalDocumentFactory);

    await app.init();
  });

  test("[DELETE] /physical-documents:id", async () => {
    const user = await userFactory.makeBqUser({ type: "Almoxarife" });

    const physicalDocumentToDelete =
      await physicalDocumentFactory.makeBqPhysicalDocument({});

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
    });

    const response = await request(app.getHttpServer())
      .delete(`/physical-documents/${physicalDocumentToDelete.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    const search = await bigquery.physicalDocument.select({
      where: { id: physicalDocumentToDelete.id.toString() },
    });

    expect(response.statusCode).toBe(201);
    expect(search).toHaveLength(0);
  });
});
