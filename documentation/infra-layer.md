# Infraestrutura

Essa é a camada mais externa da aplicação. Responsável por gerir as requisições, se comunicar com o banco de dados, gerir a lógica de autenticação e tratar os dados para apresentação ou inserção.

Para fazer essa gestão há módulos de autenticação, criptografia, banco de dados e http.

- O de autenticação configura a geração, criptografia e inserção de dados no _access token_.
- O módulo de criptografia faz o relacionamento dos casos de uso com as ferramentas utilizadas para codificar e encriptar os dados.
- O módulo do banco de dados é responsável por implementar e configurar os contratos de repositório da camada de uso. Além disso, faz a transformação dos dados entre a camada de domínio e o banco de dados. Há uma sessão só para tratar de suas especificidades.
- O módulo de http faz a gestão das requisições que chegam à aplicação através dos controladores, pipes e apresentadores. Também haverá uma sessão abaixo para esse módulo.

Além desses módulos, há nessa pasta os dois arquivos mais importantes dessa aplicação. O [main](../src/infra/main.ts), que configura o recebimento de requisições ao ouvir uma porta e aponta para o [app.module](../src/infra/app.module.ts) para que ele direcione as requisições para os controladores responsáveis.

## Módulos

No Nestjs, os módulos organizam quais arquivos devem ser utilizados e suas dependências. Sendo importantes na agregação dos componentes da aplicação. Abaixo serão listados todos os módulos dessa aplicação e o que fazem.

| Módulo                                                                        | Descrição                                                                             | Módulos Importados                             |
| :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ | :--------------------------------------------- |
| [AppModule](../src/infra/app.module.ts)                                       | Principal módulo da aplicação                                                         | HttpModule e AuthModule                        |
| [AuthModule](../src/infra/auth/auth.module.ts)                                | Gere a autenticação para acessar as rotas                                             | -                                              |
| [HttpModule](../src/infra/http/http.module.ts)                                | Agrega todos os controladores e as dependências para interagir com o banco de dados   | DatabaseModule, CryptographyModule e DtoModule |
| [DatabaseModule](../src/infra/database/database.module.ts)                    | Reúne e relaciona todos os repositórios com seus contratos da camada de domínio       | BigQueryModule                                 |
| [CryptographyModule](../src/infra/cryptography/cryptography.module.ts)        | Associa as ferramentas de encriptação com os seus contratos da camada de domínio      | -                                              |
| [DtoModule](../src/infra/http/swagger%20dto%20and%20decorators/dto.module.ts) | Reúne todos as classes DTO que possuem os parâmetros de recebimento dos controladores | -                                              |
| [BigQueryModule](../src/infra/database/bigquery/bigquery.module.ts)           | Agrega todas as classes de esquemas das tabelas do banco de dados do Bigquery         | -                                              |

### Diagrama dos módulos

![Module Diagram](module-diagram.png)

## Database

A camada do banco de dados está dividida em três seguimentos (esquemas, repositórios, mapeadores) dentro do Bigquery, que atualmente é o único banco de dados que essa aplicação interage.

### [Schemas](../src/infra/database/bigquery/schemas/)

Essa parte do projeto possui os esquemas de todas as tabelas do banco de dados. Além disso, o [BigqueryShemas](../src/infra/database/bigquery/schemas/bigquery%20schemas/bigquerySchemas.ts) contém todas os esquemas no padrão aceito pela API do Bigquery para que o BigqueryMethods não precise enviar uma requisição a mais se precisar verificar o esquema de uma tabela.

Esses Esquemas estendem o BigqueryMethods para utilizar seus métodos para essa tabela e enviam também o nome da tabela no banco de dados. Além de trazer já os relacionamentos na própria interface. Porém, ao utilizar uma consulta também aparecem, o que deve ser modificado no futuro.

### [Repositories](../src/infra/database/bigquery/repositories/)

Os repositórios são responsáveis por fazer a comunicação do projeto com o banco de dados, que nesse caso é o Bigquery do Google Cloud.

Aqui os contratos dos repositórios criados na camada de domínio são implementados utilizando os métodos de pesquisa para o Bigquery, que é a única dependência injetada.

Os métodos aqui são iguais aos utilizados nos [repositórios de teste](../test/repositories)

### [Mappers](../src/infra/database/bigquery/mappers/)

Essas classes fazem a transformação dos dados da camada de domínio para o bigquery e vice-versa. Todos esses _mappers_ possuem até dois métodos:

- `toDomain`: Transforma os dados que veem do banco de dados para a camada de domínio.
- `toBigquery`: Transforma os dados que veem da camada de domínio para o formato aceito pelo Bigquery.

Além disso, cada _Value Object_ das entidades da aplicação possuem seu próprio _mapper_. Onde somente o método `toDomain` é utilizado.

## HTTP

Além dos arquivos `main` e `app.module` estarem localizados nessa área da aplicação, também temos os controladores, os pipes, os arquivos de apresentação e os arquivos de documentação do Swagger.

### [Controllers](../src/infra/http/controllers/)

Os controladores são responsáveis por receber as requisições, tratar esses dados, utilizar os casos de uso necessários e responder essas requisições. As pastas foram divididas da mesma maneira que a camada de domínio, sendo assim, casa caso de uso tem o seu próprio controlador.

Eles utilizam o pipe de validação para verificar se os dados que estão sendo recebidos condizem com esperados, instanciam o caso de uso e usam o método `execute`, verificam se o resultado foi um sucesso ou falha e envio a resposta com base nisso.

### [Pipes](../src/infra/http/pipes/)

Nessa sessão tem apenas o pipe de validação do Zod. Ele recebe um schema de validação e verifica se os dados recebidos estão de acordo com esse esquema. Caso não esteja de acordo, ele envia o erro de código 400 com a mensagem de erro do Zod.

### [Presenters](../src/infra/http/presenters/)

Esses arquivos são utilizados para transformar os objetos de dados antes de enviar pela resposta da requisição. Ele só é utilizado caso o controlador seja do tipo _Get_ e a requisição tenha sido bem sucedida. Ele é essencial para controlar quais informações o cliente da API irá receber para não enviarmos todos os dados como no caso abaixo, onde não era necessário enviar todos os dados de todas as cinco entidades que foram consultadas pela requisição

```typescript
export class MovimentationWithDetailsPresenter {
  static toHTTP(movimentation: MovimentationWithDetails) {
    return {
      id: movimentation.movimentationId.toString(),
      createdAt: movimentation.createdAt,
      observation: movimentation.observation,
      value: movimentation.value,
      base: {
        id: movimentation.base.id.toString(),
        baseName: movimentation.base.baseName,
      },
      user: {
        id: movimentation.storekeeper.id.toString(),
        name: movimentation.storekeeper.name,
        email: movimentation.storekeeper.email,
      },
      project: {
        id: movimentation.project.id.toString(),
        project_number: movimentation.project.project_number,
      },
      material: {
        id: movimentation.material.id.toString(),
        code: movimentation.material.code,
        description: movimentation.material.description,
        unit: movimentation.material.unit,
        type: movimentation.material.type,
      },
    };
  }
}
```

### [Swagger: DTO's and Response Decorators](../src/infra/http/swagger%20dto%20and%20decorators)

Essa sessão do código instrui a ferramenta do _Swagger_ em como deverão ser os dados enviados para essa API e exemplos de respostas que ela pode enviar.

A disposição dos arquivos está feita da mesma maneira que os casos de uso da camada de domínio e dos controladores. Dentro de cada pasta de conjunto (users, contract-base etc) há duas pastas. Uma contendo os DTO's e outra contendo os _decorators_ da resposta.

#### DTO's

As classes DTO (_Data Transformation Object_), além de serem utilizadas para fazer a validação dos dados que são enviados para os controladores, elas contém os tipos, descrição e exemplos para cada parâmetro do recebimento das rotas.

Para configurar esse DTO basta injetar ele em um módulo e usar o _decorator_ `@ApiProperty` como no exemplo abaixo

```typescript
@Injectable()
export class AuthenticateBodyDto {
  @ApiProperty({
    description: "Email of the user",
    example: "colaborador@ecoeletrica.com.br",
  })
  email!: string;

  @ApiProperty({
    description: "Password of the user",
    example: "password123",
  })
  password!: string;
}
```

#### Response Decorators

Nesses arquivos, foi criado um _decorator_ para cada rota da aplicação com o `applyDecorators` para que pudéssemos utilizar os diversos exemplos de tipos de resposta da API sem poluir os arquivos dos controladores. Através desse método, Utilizamos os _decorators_ do _Swagger_ `@ApiResponse` para cada tipo de resposta diferente que possa ter. Segue o exemplo abaixo:

```typescript
export const AuthenticateDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: "Account authenticated successfully",
      schema: {
        example: {
          access_token:
            "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MjdhODQyYi1lZWVlLTQyZjItYjhhYS05YTlmYmRlZTBiODMiLCJ0eXBlIjoiQWRtaW5pc3RyYXRvciIsImJhc2VJZCI6ImRiZTgyNzEwLWU1ZTgtNDQ5YS1iYTQ5LTQ3MWIzNTZmODA4ZCIsImlhdCI6MTcyNTQ3NjM2NH0.Up0q-gBW5ai7u01D7dFeB0zy1T0zm9ffqethtRuMwq1g2bVxB_XTqrzJRzVT9Z5m2rPW17Ysu408oCsG5Zg8ddFjwtIBhqhu_FL1eQjGqmAh6KVG4mPVXwd-ydAygpXLwYgjFrG_HVxnGTqlfcwvKenCq5euGa_Kk8dVAUCOy_TmPCGrWLXeG8mpQiU00XDMMrLLL7ozJNovCbRbwE1YjaShsRZuq4ZTx-fy5b5kiWw6Omh5iFKihYxAsA6d7I9KShXPA_hp4SRxRiM2qh2ms2adj2du5bZQ9ajjmsxSBH5Qj4-_hzF0qSpK7wqnbQ3nkOrfyPUGTyRhf7eaSrka_A",
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized Exception",
      schema: {
        example: {
          message: "As credenciais não são válidas",
          error: "Unauthorized",
          statusCode: 401,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Not Found Exception",
      schema: {
        example: {
          message: "Recurso não encontrado",
          error: "Not Found",
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Bad request",
      schema: {
        example: {
          statusCode: 400,
          message: "Invalid query parameters",
          error: "Bad Request",
        },
      },
    })
  );
};
```
