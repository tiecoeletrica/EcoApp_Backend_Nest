# Technical debt

- Verify if DDD errors are communicating to nest exception errors [x]
- budget fetch use cases needs contractId on search [X]
- transfer-material needs verification if parameters exists [x]
- adjust history movimentation fetch [x]
- adjust user fetch [x]
- put controller classes on another archive [x]
- refact storekeeper and estimator use cases to include mother class user and auth by it [x]
- in fetch materials extract contractId by the accessToken [x]
- create 'edited by' and 'edited at' fields on budget entity [x]
- create get project by project_number [x]
- create register budgets [x]
- create get budgets by project_number [x]
- create update budget (this use case will create lines new budgets for that project) [x]
- create fetch budgets (by list of projects and returning just found projects) [x]
- create fetch budgets without streaming [x]
- create register estimator [x]
- create update estimator [x]
- create delete estimator [x]
- create fetch estimators [x]
- adjust user controllers to chose use case by type [x]
- create regex to register project [x]
- adjust create estimator/storekeeper to insert contractId and baseId correctly [x]
- exclude baseId from transfer Material and contract Id from Register Budget [x]
- change physical document fetch by project_number instead of projectId [x]
- change physical document to use user base [x]
- refact all use cases to search by user repository instead of estimator or storekeeper repository [x]
- return in pagination params max quantity of pages[x]
- adjust edits to appoint error in case of empty body requests[x]
- return physical document and projectIn on movimentations-budgets[x]
- adjust FetchBudgetByProject to search by contract instead of base [x]
- adjust findByProjectWithDetails from budget repository to use contract instead of base [x]
- fetch physical documents needs unitized parameter [x]
- physical documents entity and use cases needs baseId [x]
- encode / compress requests [x]
- modify data that has ' because crashes bigqueryMethods [x]
- on register project modify error message "projeto já criado" [x]
- fetch accounts use like on name search [x]
- on fetch users use like on name search [x]
- bug on creating same identifier on diferente bases [x]
- fetch movimentations history needs to filter by base [x]
- on register movimentations and budgets, put createdAt on optional parameter [x]
- don't allow inactive users to login [x]
- show correct error on transfer movimentation [x]
- on movimentation and transfer movimentation of equipment materials needs CIA and SERIE [x]
- create fetch budgets by streaming for all budgets [x]
- create register project by array [x]
- create register material by array [x]
- fetch materials by streaming [x]
- fetch movimentation history by streaming [x]
- fix bug devolução negative [x]
- user's id appear on console.log of requests [x]
- on edit user set all his tokens invalid [x]
- improve errors messages [x]
- create search by material on budgets use cases [x]
- adjust response to fetch budgets by project number [x]
- create mass replacement of materials on budgets [x]
- fix repeted budgetId on the first two budgets on budget-movimentations [x]
- fix initialization with empty values on classes that has global private variables [x]
- Create a away to migrate the schemas of "/src/infra/database/bigquery/schemas" from files to tables on bigquery []
- create supervisor entity to search data []
- adjust response decorator put budgets-materials []
- review documentations []
- on budgets-materials put show observation with replaced material []

# Test 1 file

- pnpm vitest run .\src\infra\http\controllers\get-account-by-id.controller.e2e-spec.ts --config ./vitest.config.e2e.ts

# Casos de uso para orçamento

- o orçamentista irá inserir dados dos orçamentos das obras
- para inserir o orçamento, é preciso verificar se o projeto existe.
- o orçamento inserido deverá ser verificado se há itens repetidos
- é preciso poderem corrigir os orçamentos e registrar essa modificação
- é preciso poder consultar projetos em massa
- os dados consultados em massa precisam sinalizar quais obras foram encontradas ou não
- esses dados consultados devem poder ser extraídos por EXCEL
- o orçamentista irá excluir orçamentos

# Criar novo caso de uso do zero

### Domain

- Criei a entidade no padrão que já existe
- Criei o caso de uso
  - Criei o contrato de repositório com os métodos necessários
  - Criei o InMemory... que é implementação do repositório para teste na camada de domínio
  - Criei os métodos necessários no repositório de teste
- Criei o teste para validar todas as saídas do meu caso de uso

### Infra

- Criei o repositório na camada de infra [aqui](../src/infra/database/bigquery/repositories)
- Caso necessário, criei o schema da tabela [aqui](../src/infra/database/bigquery/schemas/)
  - Adicione o schema no formato do bigquery no [BigqueryShemas](../src/infra/database/bigquery/schemas/bigquery%20schemas/bigquerySchemas.ts) para que o Query builder do Bigquery busque nesse arquivo ao invés de fazer uma requisição.
  - Adicione a nova tabela ao [BigQueryModule](../src/infra/database/bigquery/bigquery.module.ts)
- Crie o mapper daquele repositório para transformar os dados para a da camada de domínio para a infra, e vice-versa.
- Crie o arquivo de controller na sua pasta correspondente [aqui](../src/infra/http/controllers)
- Teste o controller usando a extensão Rest do arquivo [client](../client.http)
  - Criei o DTO (Data Transfer Object) do recebimento de dados daquele controller [aqui](../src/infra/http/swagger%20dto%20and%20decorators/), se houver
  - Crie o Decorator de Response daquele controller [aqui](../src/infra/http/swagger%20dto%20and%20decorators/)
- Crie o teste e2e automatizado daquele controller e já foi.

# Version commands

`pnpm version patch`
`pnpm version minor`
`pnpm version major`
`npm version patch --no-git-tag-version`
