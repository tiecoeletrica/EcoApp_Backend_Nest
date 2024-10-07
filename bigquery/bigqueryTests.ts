import { BigQuery } from "@google-cloud/bigquery";

interface bigqueryTestCreateTestDataset {
  sourceDatasetId: string;
  testDatasetId: string;
}

export class BigqueryTests {
  private readonly bigquery = new BigQuery({
    keyFilename: "bigquery/bigquery-key-api.json",
    projectId: "ecoeletricatech",
  });

  async createTestDataset(datasetsEnv: bigqueryTestCreateTestDataset) {
    const { sourceDatasetId, testDatasetId } = datasetsEnv;

    try {
      await this.bigquery.createDataset(testDatasetId, {
        location: "US", // Adjust as necessary
      });
      console.log(`Dataset ${testDatasetId} criado.`);
      // List tables in the source dataset
      const [sourceTables] = await this.bigquery
        .dataset(sourceDatasetId)
        .getTables();

      console.log(`Iniciada a cópia das tabelas do dataset ${testDatasetId}.`);
      for (const table of sourceTables) {
        // Get the schema of the table
        const [metadata] = await table.getMetadata();
        const schema = metadata.schema;

        // Create a new table in the test dataset with the same schema
        const tableId = table.id;
        if (tableId !== undefined) {
          await this.bigquery
            .dataset(testDatasetId)
            .createTable(tableId, { schema });
        }
      }
      console.log(
        `Finalizada a cópia das tabelas do dataset ${testDatasetId}.`
      );
    } catch (err) {
      console.error("Erro ao criar o dataset:", err);
    }
  }

  async deleteTestDataset(testDatasetId: string) {
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const testDataset = this.bigquery.dataset(testDatasetId);
      const [datasetExists] = await testDataset.exists();

      if (!datasetExists) {
        console.log(`Dataset ${testDatasetId} não existe.`);
        return;
      }

      const [tables] = await testDataset.getTables();

      console.log(`Excluindo tabelas no dataset ${testDatasetId}...`);
      for (const table of tables) {
        const tableId = table.id;
        if (tableId !== undefined) {
          await table.delete();
        } else {
          console.warn(`Table ID is undefined for table: ${table}`);
        }
      }

      this.delay(2000);

      console.log(`Excluindo dataset ${testDatasetId}...`);
      await testDataset.delete();
    } catch (err) {
      console.error("Erro ao deletar o dataset:", err);
    }
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
