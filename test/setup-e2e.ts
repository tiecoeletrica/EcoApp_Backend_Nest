import { BigqueryTests } from "bigquery/bigqueryTests";
import { randomUUID } from "crypto";
import "dotenv/config";

const bigqueryTest = new BigqueryTests();
const testDatasetId = randomUUID().toString().slice(0,5);

beforeAll(async () => {
  if (process.env.DATASET_ID_PRODUCTION !== undefined)
    await bigqueryTest.createTestDataset({
      sourceDatasetId: process.env.DATASET_ID_PRODUCTION,
      testDatasetId,
    });
  else {
    throw new Error("Não foi encontrado as variáveis de ambiente");
  }

  process.env.DATASET_ID_PRODUCTION = testDatasetId;
});

afterAll(async () => {
  if (testDatasetId)
    await bigqueryTest.deleteTestDataset(testDatasetId);
  else {
    throw new Error("Não foi encontrado as variáveis de ambiente");
  }
});