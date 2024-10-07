# Domain

Na camada de domínio temos a camada mais interna da aplicação. Onde as lógicas dos requisitos do projetos estão traduzidas em _scripts_.

Essa camada de domínio reúne as entidades, os casos de uso e os contratos de repositório da aplicação. Além disso, há também alguns outros arquivos auxiliares como o _encrypter_, os _Value Objects_ os erros personalizados etc.

Para que essa aplicação consiga receber outras funcionalidades no futuro, primeiramente criamos a pasta [material-movimentation](../src/domain/material-movimentation) para reunir todos os arquivos específicos relacionados da 02 (movimentação) e orçamento. Dentre eles temos os arquivos referentes ao [_application_](../src/domain/material-movimentation/application) que armazena os arquivos referentes aos requisitos do sistema e [_enterprise_](../src/domain/material-movimentation/enterprise) que tem os arquivos referentes às entidades e seus parâmetros.

## Application

Nessa camada da aplicação temos os contratos para os repositórios da aplicação e para os métodos de criptografia, além dos casos de uso.

### Cryptography

Essa sessão cria os contratos de criptografia da aplicação.

- O _Encypter_ que cria o accesstoken e insere alguns dados do usuário criptografados nesse token.
- O _HashComparer_ que compara se uma string criptografada é a mesma que a informada pelo usuário.
- O _HashGenerator_ que encripta uma string de senha.

### Repositories

Nessa sessão, cada entidade que precisa de um repositório para guardar suas informações recebe um _contrato de repositório_. Esses contratos servem para dizer quais os métodos necessários para interagir com aquele repositório. Segue um exemplo abaixo

```typescript
export abstract class ContractRepository {
  abstract create(Contract: Contract): Promise<void>;
  abstract findByContractName(contractName: string): Promise<Contract | null>;
  abstract findById(contractId: string): Promise<Contract | null>;
  abstract findMany(params: PaginationParams): Promise<Contract[]>;
}
```

### Use Cases

Os casos de uso exemplificam tipos de iteração que os usuários terão nessa aplicação. Elas estão organizadas pelas entidades desses casos de uso conforme tabela abaixo:

| Pasta                                                                                                                    | Descrição                                                                                                |
| :----------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| [contract-base](../src/domain/material-movimentation/application/use-cases/contract-base)                                | reúne os casos de uso de criação e listagem de contratos e bases                                         |
| [material](../src/domain/material-movimentation/application/use-cases/material)                                          | reúne os casos de uso de cadastro de materiais e sua listagem                                            |
| [physicalDocument](../src/domain/material-movimentation/application/use-cases/physicalDocument/)                         | reúne os casos de uso de cadastro de materiais e sua listagem                                            |
| [project-movimentation-budget](../src/domain/material-movimentation/application/use-cases/project-movimentation-budget/) | reúne os principais casos de uso da aplicação. Que abrange os orçamentos, as movimentações e os projetos |
| [users](../src/domain/material-movimentation/application/use-cases/users/)                                               | reúne todos os casos de uso ligados aos usuários                                                         |

A pasta de [errors](../src/domain/material-movimentation/application/use-cases/errors) implementa a classe de erro natural do javascript/typescript para informar mais detalhes do erro na resposta do caso de uso.

## Enterprise

### Entities

Nessa sessão estão as entidades e lógica de criação das mesmas. Cada entidade estende a classe [Entity](../src/core/entities/entity.ts) para configuração automática do seu ID independente dos outros parâmetros daquela classe.

Todas os parâmetros recebem os seus _getters_ e, para aqueles parâmetros que poderão ser alterados depois, também os _setters_.

### Value Objects

Essas entidades são auxiliares das entidades que já existem, até por isso elas não tem um ID próprio. Esses auxiliares são utilizados para criar uma tipagem específica para algum parâmetro de outra entidade ou para organizar a apresentação de alguns dados. Como é o caso de [BaseWithContract](../src/domain/material-movimentation/enterprise/entities/value-objects/base-with-contract.ts) que além dos dados da base ele entrega também todos os dados do contrato relacionado a essa base.

```typescript
export interface BaseWithContractProps {
  baseId: UniqueEntityID;
  baseName: string;
  contract: contractInBase;
}

export interface contractInBase {
  id: UniqueEntityID;
  contractName: string;
}

export class BaseWithContract extends ValueObject<BaseWithContractProps> {
  get baseId() {
    return this.props.baseId;
  }
  get baseName() {
    return this.props.baseName;
  }
  get contract() {
    return this.props.contract;
  }

  static create(props: BaseWithContractProps) {
    return new BaseWithContract(props);
  }
}
```

