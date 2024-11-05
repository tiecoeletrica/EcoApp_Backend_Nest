import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { BigQueryService } from "src/infra/database/bigquery/bigquery.service";
import { JwtService } from "@nestjs/jwt";
import { UserFactory } from "test/factories/make-user";
import { DatabaseModule } from "src/infra/database/database.module";
import { PhysicalDocumentFactory } from "test/factories/make-physical-document";
import { AccessTokenCreator } from "test/access-token-creator";

describe("Unitize Physical Document (E2E)", () => {
  let app: INestApplication;
  let bigquery: BigQueryService;
  let userFactory: UserFactory;
  let accessTokenCreator: AccessTokenCreator;
  let physicalDocumentFactory: PhysicalDocumentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, AccessTokenCreator, PhysicalDocumentFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    bigquery = moduleRef.get(BigQueryService);
    userFactory = moduleRef.get(UserFactory);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    physicalDocumentFactory = moduleRef.get(PhysicalDocumentFactory);

    await app.init();
  });

  test("[PUT] /physical-documents:id", async () => {
    const user = await userFactory.makeBqUser({ type: "Almoxarife" });

    const physicalDocument =
      await physicalDocumentFactory.makeBqPhysicalDocument({ identifier: 1 });

    const accessToken = accessTokenCreator.execute(user);

    const response = await request(app.getHttpServer())
      .put(`/physical-documents/${physicalDocument.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        unitized: true,
      });

    const [physicalDocumentDataBase] = await bigquery.physicalDocument.select({
      where: { identifier: 1 },
    });

    expect(response.statusCode).toBe(201);
    expect(physicalDocumentDataBase.unitized).toEqual(true);
  });
});
