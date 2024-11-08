# Nest EcoApp

![Versão](https://img.shields.io/github/package-json/v/tiecoeletrica/EcoApp_Backend_Nest) ![NpmBadge](https://img.shields.io/npm/v/npm.svg?logo=npm) ![NodeBadge](https://img.shields.io/npm/v/node.svg?logo=nodedotjs&label=node) ![NestBadge](https://img.shields.io/npm/v/@nestjs/common.svg?logo=nestjs&label=NestJs) ![VitestBadge](https://img.shields.io/npm/v/vitest.svg?logo=vitest&label=vitest)

## Sumário

- [Nest EcoApp](#nest-ecoapp)
  - [Descrição](#descrição)
  - [Funcionalidades Principais](#funcionalidades-principais)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
  - [Executando a aplicação](#executando-a-aplicação)
  - [Documentação das rotas via Swagger](#documentação-das-rotas-via-swagger)
  - [Estrutura de Pastas do Projeto](#estrutura-de-pastas-do-projeto)
  - [Testes](#testes)
  - [Contato](#contato)
- [Query Builder do Bigquery](/documentation/bigquery-query-builder.md)
- [Camada de Domínio](/documentation/domain-layer.md)
- [Camada de Infraestrutura](/documentation/infra-layer.md)
- [Testes Automatizados](/documentation/automated-tests.md)

## Descrição

Nest EcoApp é uma aplicação backend desenvolvida com NestJS para gerenciar operações relacionadas a almoxarifados e orçamentos de obras. O projeto utiliza TypeScript e integra-se com o Google BigQuery para armazenamento e recuperação de dados. Futuramente será incluso outros módulos como a programação de obras, chamados do TI, gerenciamento de produção de campo, dentre outros.

## Funcionalidades Principais

- Query Builder para o Bigquery do Google Cloud
- Autenticação de usuários
- Gerenciamento de movimentações de material
- Gerenciamento de orçamentos de obras

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Conta Google Cloud com BigQuery configurado

## Instalação

1. Clone o repositório: git clone https://github.com/tiecoeletrica/EcoApp_Backend_Nest.git
2. Navegue até o diretório do projeto:
   cd nest_ecoapp
3. Instale as dependências:
   npm install ou
   yarn install
4. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto e adicione as variáveis abaixo segundo o arquivo [env.example](.env.example) :

```
JWT_PRIVATE_KEY="sua-chave-privada"
JWT_PUBLIC_KEY="sua-chave-pública"
PORT=numero da porta
DATASET_ID_PRODUCTION=seu_dataset_id
BIGQUERY_PROJECT_ID=seu_project_id
BIGQUERY_PRIVATE_KEY=sua_private_key
BIGQUERY_CLIENT_EMAIL=seu_client_email
```

5. Ajuste os [schemas do bigquery](src/infra/database/bigquery/schemas/bigquery%20schemas/bigquerySchemas.ts) se seu projeto estiver com as tabelas diferentes

## Executando a aplicação

Para iniciar a aplicação em modo de desenvolvimento:
npm run start:dev ou
yarn start:dev

## Documentação das rotas via Swagger

Para visualizar a documentação do swagger basta acessar o endereço que essa aplicação estiver funcionando e acessar a rota `/api` no seu navegador. Se a aplicação for iniciada sem modificações, acesse [localhost:3333/api](http://localhost:3333/api).

## Estrutura de Pastas do Projeto

`Principais arquivos e pastas`

```plaintext
bigquery/
test
src/
├── core/
│   ├── types/
│   ├── entities/
│   ├── errors/
│   └── respositories/
├── domain/
│   └── material-movimenattion/
│       └── material-movimenattion/
│           ├── application/
│           │   ├── auhtorization/
│           │   ├── cryptography/
│           │   ├── repositories/
│           │   └── use-cases/
│           └── enterprise/
│               └── esntities/
└── infra/
    ├── app.module.ts
    ├── main.ts
    ├── auth/
    │   └── auth.module.ts
    ├── cryptography/
    │   └── cryptography.module.ts
    ├── database/
    │   ├── database.module.ts
    │   └── bigquery/
    │       ├── mappers/
    │       ├── respositories/
    │       ├── schemas/
    │       └── bigquery.module.ts
    └── http/
        ├── http.module.ts
        ├── controllers/
        ├── pipes/
        ├── presenters/
        └── swagger dto and decorators/
            └── dto.module.ts
```

## Testes

Para executar os testes:

- npm run test `executa os testes da camada de domínio`
- npm run test:e2e `executa os testes da camada de infraestrutura`

## Contato

Rodrigo Frutuoso - [GitHub](https://github.com/rodfrutuoso)

Link do Projeto: [EcoApp_Backend_Nest](https://github.com/tiecoeletrica/EcoApp_Backend_Nest)
