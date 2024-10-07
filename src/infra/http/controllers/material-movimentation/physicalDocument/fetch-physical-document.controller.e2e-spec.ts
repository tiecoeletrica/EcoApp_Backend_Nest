import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { PhysicalDocumentFactory } from "test/factories/make-physical-document";

describe("Fetch Physical Documents (E2E)", () => {
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

  test("[GET] /physical-documents", async () => {
    const user = await userFactory.makeBqUser({});

    await physicalDocumentFactory.makeBqPhysicalDocument({ identifier: 2 });
    await physicalDocumentFactory.makeBqPhysicalDocument({ identifier: 2 });
    await physicalDocumentFactory.makeBqPhysicalDocument({ identifier: 2 });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      type: user.type,
      baseId: user.baseId.toString(),
      contractId: user.contractId.toString(),
    });

    const response = await request(app.getHttpServer())
      .get("/physical-documents?identifier=2")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body.physicalDocuments).toHaveLength(3);
  });
});
