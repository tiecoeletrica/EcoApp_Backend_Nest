# Testes Automatizados

Esse projeto utiliza o [Vitest](https://vitest.dev/) para a realizam dos testes automatizados por utilizar diretamente o Typescript ao invés de ter que converter para o Javascript antes. O que torna esses testes mais rápidos.

Os testes foram criados para todos os casos de uso e todos os controladores. Além de alguns outros arquivos de configuração.

## Comandos

Para executar os testes há alguns comandos que testam diferentes partes da aplicação de diferentes maneiras. Segue abaixo os principais

- `npm run test`: Executa todos os testes da camada de domínio.
- `npm run test:watch`: Executa todos os testes da camada de domínio e refaz os testes cada vez que um arquivo que influencie aquele teste for modificado.
- `npm run test:e2e`: Executa todos os testes da camada de infraestrutura.
- `npm run test:e2e:watch`: Executa todos os testes da camada de infraestrutura e refaz os testes cada vez que um arquivo que influencie aquele teste for modificado.
- `npm run test caminho\do\arquivo`: Executa um teste em específico
- `npm run test caminho\do\arquivo --config ./vitest.config.e2e.ts`: Executa um teste em específico utilizando a configuração dos testes _end to end_

## Testes da Camada de Domínio

Para cada caso de uso foi criado um teste de mesmo nome com o sufixo `.spec.ts`. Esses testes estão localizados na mesma pasta do caso de uso.

Para configurar o ambiente para esses testes, todos os arquivos `spec` contém um método `beforeEach` onde a classe do caso de uso é instanciada e chamada de "sut" (System Under Test). Nesse `beforeEach` também são inicializadas as classes dos repositórios de teste, que estão detalhados abaixo.

Além disso, quando necessário criar entidades de suporte para testar um caso de uso utilizamos um script de criação aleatória com as funções que começam com _make_. Segue exemplo abaixo:

```typescript
it("should be able to authenticate a storekeeper", async () => {
  const storekeeper = makeUser({
    email: "rodrigo@ecoeletrica.com",
    password: await fakeHasher.hash("123456"),
  });

  await inMemoryStorekeeperRepository.create(storekeeper);

  const result = await sut.execute({
    email: "rodrigo@ecoeletrica.com",
    password: "123456",
  });

  expect(result.isRight()).toBe(true);
  expect(result.value).toEqual({
    accessToken: expect.any(String),
  });
});
```

## Testes da Camada de Infraestrutura

Os testes _end to end_ simulam uma aplicação Nestjs em produção, além de criar uma cópia das tabelas do banco de dados do Bigquery para que esses testes fiquem o mais próximo da realidade.

O módulo de configuração do Bigquery para o teste está descrito na última sessão da documentação do [Bigquery](../documentation/bigquery-query-builder.md).

Quanto à configuração do Nestjs, no método `beforeAll` é inicializada uma aplicação Nest com as dependências do `AppModule` e do `DatabaseModule`. Além disso, inserimos as `factories` necessárias para criar algumas entidades diretamente no banco de dados de testes. Segue exemplo abaixo.

```typescript
beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule, DatabaseModule],
    providers: [UserFactory],
  }).compile();

  app = moduleRef.createNestApplication();

  bigquery = moduleRef.get(BigQueryService);
  userFactory = moduleRef.get(UserFactory);

  await app.init();
});
```

## Scripts Auxiliares

Na pasta [test](../test), na raiz da aplicação, contém scripts que auxiliam os testes da camada de domínio e infraestrutura para que possam ser realizados com maior praticidade. Há três sessões na pasta de testes, a de criptografia, as fábricas de entidades e os repositórios de teste.

### [Cryptography](../test/cryptography)

Essa sessão usa dos contratos de criptografia de autenticação e senha para simular essas encriptações.

### [Factories](../test/factories)

As fábricas são divididas pela entidade que elas estão criando. Elas utilizam a biblioteca [faker](https://fakerjs.dev/) para criar valores aleatórios que condizem com o tipo de parâmetro da entidade.

Além disso, em todos os arquivos há uma função de criação da entidade no nível de domínio e uma classe que converte essa entidade para o tipo aceito pelo banco de dados e a insere no Bigquery. Segue exemplo abaixo:

```typescript
export function makeBase(
  override: Partial<BaseProps> = {},
  id?: UniqueEntityID
) {
  const base = Base.create(
    {
      contractId: new UniqueEntityID(),
      baseName: faker.location.city(),
      ...override,
    },
    id
  );

  return base;
}

@Injectable()
export class BaseFactory {
  constructor(private bigquery: BigQueryService) {}

  async makeBqBase(data: Partial<BaseProps> = {}): Promise<Base> {
    const base = makeBase(data);

    await this.bigquery.base.create([BqBaseMapper.toBigquery(base)]);

    return base;
  }
}
```

### [Repositories](../test/repositories/)

Esses repositórios utilizam o contrato da camada de domínio para interagir com um vetor do tipo da entidade daquele repositório, que é onde os dados de testes são armazenados. Ou seja, o repositório para testes da camada de domínio é um vetor de objetos.
