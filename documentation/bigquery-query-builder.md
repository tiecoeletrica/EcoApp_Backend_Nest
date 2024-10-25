# Query Builder para Bigquery

Para este projeto foi escolhido o Bigquery como banco de dados pela segurança de armazenamento dos dados e facilidade de criar uma aplicação escalonável com o Cloud Run da Google Cloud. Para isso, é utilizado API do Bigquery para fazer essa comunicação.

## Funcionalidades Principais

- Possui as operações de _Select_, _Insert_, _Update_ e _Delete_.
- O _Select_ possui implementado as funções principais para busca de dados em uma ou mais tabelas.
- Ele realiza copias de conjuntos de dados no Bigquery para a realização dos testes e2e em um local que não seja o banco de dados principal.

## Como Utilizar

### Consultas

O arquivo principal para as operações é o [bigqueryMethods](../bigquery/bigqueryMethods.ts). Nele há todos os métodos que podem ser utilizados por esse Query Builder. Depois de localizar esse arquivo:

1. Crie uma classe que represente a tabela que será pesquisada no banco de dados que estenda a classe do [bigqueryMethods](../bigquery/bigqueryMethods.ts) segundo o exemplo abaixo:

   ```typescript
   const tableId = "base"; // nome da tabela no banco de dados

   export interface BqBaseProps {
     id?: string;
     baseName: string;
     contractId: string;

     // parâmetro para armazenar os relacionamentos
     contract?: BqContractProps;
   }

   @Injectable()
   export class Base extends BigQueryMethods<BqBaseProps> {
     constructor() {
       super(tableId);
     }
   }
   ```

2. Reúna todas as tabelas em um serviço. No caso desse projeto, todas as tabelas foram injetadas na classe [bigquery.service.ts](../src/infra/database/bigquery/bigquery.service.ts).
3. No repositório, injete o BigqueryService e navegue entre as opções de pesquisa pelos parâmetros do método, selecionando a tabela principal de pesquisa como mostra o exemplo abaixo:

   ```typescript
   @Injectable()
   export class BqBaseRepository implements BaseRepository {
     constructor(private bigquery: BigQueryService) {}

     async create(base: Base): Promise<void> {
       const data = BqBaseMapper.toBigquery(base);

       await this.bigquery.base.create([data]);
     }
   }
   ```

### Testes

Para configurar os testes, é necessário utilizar [BigqueryTests](../bigquery/bigqueryTests.ts)

1. O primeiro passo é instanciar essa classe [BigqueryTests](../bigquery/bigqueryTests.ts).
2. Depois chamar os métodos `createTestDataset` no _beforeAll_ e `deleteTestDataset` no _afterAll_.
3. Atribuir à `process.env.DATASET_ID_PRODUCTION` o novo conjunto de dados criado para utilizar esse novo conjunto de dados durante os testes.

- O arquivo que faz essa configuração nesse projeto é o [setup-e2e.ts](../test/setup-e2e.ts).

## Bigquery Methods

Essa [classe](../bigquery/bigqueryMethods.ts) reúne todas as operações entre a aplicação e o banco de dados.

- Para utilizar o método `create` é necessário enviar um array de objetos da classe da tabela que está sendo instanciada.

  ```typescript
  async create(base: Base): Promise<void> {
    const data = BqBaseMapper.toBigquery(base);

    await this.bigquery.base.create([data]);
  }
  ```

- O `update` recebe os parâmetros de `data`, o objeto da mesma classe que a tabela contendo os dados que serão inseridos, e o `where` que contém as condições para essa edição.
  ```typescript
  async save(physicalDocument: PhysicalDocument): Promise<void> {
    await this.bigquery.physicalDocument.update({
      data: BqPhysicalDocumentMapper.toBigquery(physicalDocument),
      where: { id: BqPhysicalDocumentMapper.toBigquery(physicalDocument).id },
    });
  }
  ```
- O `delete` recebe um objeto com os parâmetros que faz a pesquisa dos dados que devem ser excluídos.
  ```typescript
  async delete(physicalDocumentId: string): Promise<void> {
    await this.bigquery.physicalDocument.delete({ id: physicalDocumentId });
  }
  ```
- Já o `select` possui diversos parâmetros, todos opcionais que ajustam a consulta de acordo com a necessidade. Dentre eles temos:
  | Método | Uso | parâmetros |
  | :---------------- | :------ | :--------- |
  | where | delimitador da consulta | colunas da tabela |
  | whereIn | delimitador da consulta para um array de dados | colunas da tabela (aceita arrays) |
  | greaterOrEqualThan | delimitador da consulta | colunas da tabela |
  | lessOrEqualThan | delimitador da consulta | colunas da tabela |
  | columns | delimitador das colunas do resultado | colunas da tabela |
  | like | delimitador da consulta por proximidade do texto | colunas da tabela |
  | join | consulta de múltiplas tabelas | tabela à pesquisar e cláusula "on" |
  | distinct | consultar somente valores únicos | verdadeiro ou falso |
  | orderBy | ordenar dados | coluna da tabela e direção (ASC ou DESC) |
  | groupBy | agrupar dados | colunas da tabela |
  | limit | limitar quantidade de linhas do resultado | número limite |
  | offset | desloca quantidade de linhas do resultado | número de linhas deslocadas |
  | include | inclui tabelas que estão relacionadas | Configuração do "join" e o tipo de relacionamento |
  | count_results | retorna a quantidade de resultados da pesquisa | verdadeiro ou falso |

  Segue um exemplo de utilização do `select` utilizando vários dos métodos acima

  ```typescript
  async findManyHistoryWithDetails(
    { page }: PaginationParams,
    baseId?: string,
    storekeeperId?: string,
    projectId?: string,
    materialId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<MovimentationWithDetails[]> {
    const pageCount = 40;

    const movimentations = await this.bigquery.movimentation.select({
      where: { baseId, userId: storekeeperId, projectId, materialId },
      greaterOrEqualThan: { createdAt: startDate },
      lessOrEqualThan: { createdAt: endDate },
      limit: pageCount,
      offset: pageCount * (page - 1),
      orderBy: { column: "materialId", direction: "ASC" },
      include: {
        project: {
          join: {
            table: "project",
            on: "movimentation.projectId = project.id",
          },
          relationType: "one-to-one",
        },
        base: {
          join: {
            table: "base",
            on: "movimentation.baseId = base.id",
          },
          relationType: "one-to-one",
        },
        user: {
          join: {
            table: "user",
            on: "movimentation.userId = user.id",
          },
          relationType: "one-to-one",
        },
        material: {
          join: {
            table: "material",
            on: "movimentation.materialId = material.id",
          },
          relationType: "one-to-one",
        },
      },
    });

    return movimentations.map(BqMovimentationWithDetailsMapper.toDomain);
  }
  ```

## Bigquery Tests

Essa [classe](../bigquery/bigqueryTests.ts) possui apenas dois métodos. Um para copiar todas as tabelas de um conjunto de dados do Bigquery: `createTestDataset`. E outro para excluir esse conjunto de dados criado para a realização do teste: `deleteTestDataset`.

Nesse projeto é utilizado o **Vitest** para a realização dos testes automatizados. Nele é possível configurar os testes e2e através do arquivo [vitest.config.e2e](../vitest.config.e2e.ts). Onde eu aponto que o arquivo de configuração dos testes, que defini o que acontece antes de depois de cada teste, é o [setup-e2e](../test/setup-e2e.ts). Nele instanciamos o BigqueryTests, modificamos o conjunto de dados para o novo criado e depois excluímos como mostrado abaixo.

```typescript
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
  if (testDatasetId) await bigqueryTest.deleteTestDataset(testDatasetId);
  else {
    throw new Error("Não foi encontrado as variáveis de ambiente");
  }
});
```
