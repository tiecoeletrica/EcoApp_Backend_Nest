export class BigqueryShemas {
  static getSchema(table: string) {
    return allSchemas[table];
  }
}

const allSchemas = {
  base: {
    fields: [
      {
        name: "id",
        type: "STRING",
        mode: "REQUIRED",
        defaultValueExpression: "GENERATE_UUID()",
      },
      { name: "baseName", type: "STRING", mode: "REQUIRED" },
      { name: "contractId", type: "STRING", mode: "REQUIRED" },
    ],
  },
  budget: {
    fields: [
      {
        name: "id",
        type: "STRING",
        mode: "REQUIRED",
        defaultValueExpression: "GENERATE_UUID()",
      },
      { name: "projectId", type: "STRING", mode: "REQUIRED" },
      { name: "materialId", type: "STRING", mode: "REQUIRED" },
      { name: "value", type: "BIGNUMERIC", mode: "REQUIRED" },
      {
        name: "createdAt",
        type: "TIMESTAMP",
        mode: "REQUIRED",
        defaultValueExpression: "CURRENT_TIMESTAMP()",
      },
      { name: "userId", type: "STRING", mode: "REQUIRED" },
      { name: "contractId", type: "STRING", mode: "REQUIRED" },
      { name: "updatedAuthorId", type: "STRING", mode: "NULLABLE" },
      { name: "updatedAt", type: "TIMESTAMP", mode: "NULLABLE" },
    ],
  },
  contract: {
    fields: [
      {
        name: "id",
        type: "STRING",
        mode: "REQUIRED",
        defaultValueExpression: "GENERATE_UUID()",
      },
      { name: "contractName", type: "STRING", mode: "REQUIRED" },
    ],
  },
  material: {
    fields: [
      { name: "id", type: "STRING", mode: "NULLABLE" },
      { name: "code", type: "BIGNUMERIC", mode: "NULLABLE" },
      { name: "description", type: "STRING", mode: "NULLABLE" },
      { name: "type", type: "STRING", mode: "NULLABLE" },
      { name: "unit", type: "STRING", mode: "NULLABLE" },
      { name: "contractId", type: "STRING", mode: "NULLABLE" },
    ],
  },
  movimentation: {
    fields: [
      {
        name: "id",
        type: "STRING",
        mode: "REQUIRED",
        defaultValueExpression: "GENERATE_UUID()",
      },
      { name: "materialId", type: "STRING", mode: "REQUIRED" },
      { name: "projectId", type: "STRING", mode: "REQUIRED" },
      { name: "value", type: "BIGNUMERIC", mode: "REQUIRED" },
      { name: "userId", type: "STRING", mode: "REQUIRED" },
      {
        name: "createdAt",
        type: "TIMESTAMP",
        mode: "NULLABLE",
        defaultValueExpression: "CURRENT_TIMESTAMP()",
      },
      { name: "observation", type: "STRING", mode: "NULLABLE" },
      { name: "baseId", type: "STRING", mode: "NULLABLE" },
    ],
  },
  physical_document: {
    fields: [
      {
        name: "id",
        type: "STRING",
        mode: "NULLABLE",
        defaultValueExpression: "GENERATE_UUID()",
      },
      { name: "projectId", type: "STRING", mode: "REQUIRED" },
      { name: "unitized", type: "BOOLEAN", mode: "NULLABLE" },
      { name: "identifier", type: "INTEGER", mode: "REQUIRED" },
    ],
  },
  project: {
    fields: [
      { name: "project_number", type: "STRING", mode: "REQUIRED" },
      { name: "description", type: "STRING", mode: "NULLABLE" },
      { name: "type", type: "STRING", mode: "REQUIRED" },
      { name: "baseId", type: "STRING", mode: "REQUIRED" },
      { name: "city", type: "STRING", mode: "NULLABLE" },
      {
        name: "id",
        type: "STRING",
        mode: "NULLABLE",
        defaultValueExpression: "GENERATE_UUID()",
      },
    ],
  },
  user: {
    fields: [
      {
        name: "id",
        type: "STRING",
        mode: "REQUIRED",
        defaultValueExpression: "GENERATE_UUID()",
      },
      { name: "name", type: "STRING", mode: "REQUIRED" },
      { name: "email", type: "STRING", mode: "NULLABLE" },
      { name: "password", type: "STRING", mode: "REQUIRED" },
      { name: "cpf", type: "STRING", mode: "NULLABLE" },
      { name: "type", type: "STRING", mode: "NULLABLE" },
      { name: "status", type: "STRING", mode: "NULLABLE" },
      { name: "baseId", type: "STRING", mode: "NULLABLE" },
      { name: "contractId", type: "STRING", mode: "NULLABLE" },
    ],
  },
};
