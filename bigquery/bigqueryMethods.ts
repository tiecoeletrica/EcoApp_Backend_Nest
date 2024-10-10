import { BigQuery } from "@google-cloud/bigquery";
import { NotFoundException } from "@nestjs/common";
import "dotenv/config";
import { BigqueryShemas } from "src/infra/database/bigquery/schemas/bigquery schemas/bigquerySchemas";

export interface UpdateProps<T> {
  data: Partial<T>;
  where: Partial<T>;
}

export interface SelectOptions<T> {
  where?: Partial<T> | { OR: Partial<T>[]; AND?: Partial<T> };
  whereIn?: { [K in keyof T]?: any[] };
  greaterOrEqualThan?: Partial<T>;
  lessOrEqualThan?: Partial<T>;
  columns?: (keyof T)[];
  like?: Partial<T>;
  join?: { table: string; on: string };
  distinct?: boolean;
  orderBy?: { column: keyof T; direction: "ASC" | "DESC" };
  groupBy?: (keyof T)[];
  limit?: number;
  offset?: number;
  include?: { [K in keyof T]?: IncludeOptions<T[K]> };
  count_results?: boolean;
}

export interface IncludeOptions<T> {
  join: { table: string; on: string };
  relationType: "one-to-one" | "one-to-many" | "many-to-many" | "many-to-one";
}

export class BigQueryMethods<T extends Record<string, any>> {
  private readonly bigquery = new BigQuery({
    projectId: process.env.BIGQUERY_PROJECT_ID,
    credentials: {
      private_key: process.env.BIGQUERY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.BIGQUERY_CLIENT_EMAIL,
    },
  });

  private readonly datasetId: string;

  constructor(TableId: string) {
    const datasetId = process.env.DATASET_ID_PRODUCTION;
    this.datasetId = datasetId + "." + TableId;
  }

  async runQuery(query: string) {
    const options = { query };
    const [rows] = await this.bigquery.query(options);

    return rows;
  }

  async create(data: T[]): Promise<{}> {
    if (data.length === 0) {
      throw new NotFoundException("Não há dados a serem retornados");
    }
    const query = this.buildInsertQuery(data);
    return this.runQuery(query);
  }
  //overloads
  select(
    options: SelectOptions<T> & { count_results: true }
  ): Promise<{ results: T[]; total_count: number }>;
  select(options?: SelectOptions<T>): Promise<T[]>;

  async select(
    options: SelectOptions<T> = {}
  ): Promise<T[] | { results: T[]; total_count: number }> {
    const query = this.buildSelectQuery(options);
    let rows = await this.runQuery(query);
    const totalCount = rows[0]?.total_count ?? 0;
    rows = await this.processQueryResults(rows, options.include);

    if (options.count_results) {
      const results = rows.map((row) => {
        const { total_count, ...rest } = row;
        return rest as T;
      });
      return { results, total_count: Number(totalCount) };
    }

    return rows;
  }

  async update(props: UpdateProps<T>): Promise<{}> {
    const query = this.buildUpdateQuery(props);
    return this.runQuery(query);
  }

  async delete(where: Partial<T>): Promise<{}> {
    const query = this.buildDeleteQuery(where);
    return this.runQuery(query);
  }

  private buildInsertQuery(data: T[]): string {
    const fields = this.getFieldsForInsert(data[0]);
    const values = this.getValuesForInsert(data);
    return `
      INSERT INTO \`${this.datasetId}\`
      (${fields})
      VALUES
      ${values}
    `;
  }

  private getFieldsForInsert(data: T): string {
    return Object.keys(data)
      .filter((key) => data[key] !== undefined)
      .join(", ");
  }

  private getValuesForInsert(data: T[]): string {
    return data
      .map(
        (row) =>
          "(" +
          Object.entries(row)
            .filter(([_, value]) => value !== undefined)
            .map(([_, value]) => this.formatValue(value))
            .join(", ") +
          ")"
      )
      .join(", ");
  }

  private formatValue(value: any): string {
    if (typeof value === "string") return `'${this.escapeString(value)}'`;
    if (value instanceof Date) return `'${value.toISOString()}'`;
    return value;
  }

  private escapeString(str: string): string {
    return str.replace(/'/g, `"`);
  }

  private buildSelectQuery(options: SelectOptions<T>): string {
    const {
      where,
      whereIn,
      greaterOrEqualThan,
      lessOrEqualThan,
      columns,
      like,
      join,
      distinct,
      orderBy,
      groupBy,
      limit,
      offset,
      include,
      count_results,
    } = options;

    const tableAlias = this.datasetId.split(".")[1];
    let selectColumns = this.buildSelectColumns(tableAlias, columns);
    if (count_results) {
      selectColumns = `COUNT(*) OVER() AS total_count, ${selectColumns}`;
    }
    const distinctClause = distinct ? "DISTINCT" : "";
    const whereClauses = this.buildWhereClauses(
      tableAlias,
      where,
      whereIn,
      greaterOrEqualThan,
      lessOrEqualThan,
      like
    );
    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const joinClause = this.buildJoinClause(join);
    const groupByClause = this.buildGroupByClause(tableAlias, groupBy);
    const orderByClause = this.buildOrderByClause(tableAlias, orderBy);
    const limitClause = limit ? `LIMIT ${limit}` : "";
    const offsetClause = offset ? `OFFSET ${offset}` : "";

    let query = `
    SELECT ${distinctClause} ${selectColumns} FROM \`${this.datasetId}\` AS ${tableAlias}
    ${joinClause}
    ${whereClause}
    ${groupByClause}
    ${orderByClause}
    ${limitClause}
    ${offsetClause}
  `;

    if (include) {
      query = this.buildQueryWithIncludes(
        query,
        tableAlias,
        include,
        distinctClause,
        selectColumns,
        whereClause,
        groupByClause,
        orderByClause,
        limitClause,
        offsetClause
      );
    }

    return query;
  }

  private buildSelectColumns(
    tableAlias: string,
    columns?: (keyof T)[]
  ): string {
    return columns
      ? columns.map((col) => `${tableAlias}.${String(col)}`).join(", ")
      : `*`;
  }

  private buildWhereClauses(
    tableAlias: string,
    where?: Partial<T> | { OR: Partial<T>[]; AND?: Partial<T> },
    whereIn?: { [K in keyof T]?: any[] },
    greaterOrEqualThan?: Partial<T>,
    lessOrEqualThan?: Partial<T>,
    like?: Partial<T>
  ): string[] {
    const whereClauses: string[] = [];

    if (where) {
      if (this.isOrCondition(where)) {
        const orClause = this.buildOrWhereClause(tableAlias, where.OR);
        const andClause = where.AND
          ? this.buildWhereClause(tableAlias, where.AND)
          : "";
        if (andClause) {
          whereClauses.push(`(${orClause}) AND (${andClause})`);
        } else {
          whereClauses.push(orClause);
        }
      } else {
        whereClauses.push(this.buildWhereClause(tableAlias, where));
      }
    }

    if (whereIn) {
      whereClauses.push(this.buildWhereInClause(tableAlias, whereIn));
    }

    if (greaterOrEqualThan) {
      whereClauses.push(
        this.buildComparisonClause(tableAlias, greaterOrEqualThan, ">=")
      );
    }

    if (lessOrEqualThan) {
      whereClauses.push(
        this.buildComparisonClause(tableAlias, lessOrEqualThan, "<=")
      );
    }

    if (like) {
      whereClauses.push(this.buildLikeClause(tableAlias, like));
    }

    return whereClauses.filter((clause) => clause !== "");
  }

  private isOrCondition(
    where: Partial<T> | { OR: Partial<T>[] }
  ): where is { OR: Partial<T>[] } {
    return "OR" in where && Array.isArray((where as any).OR);
  }

  private buildWhereClause(
    tableAlias: string | null,
    where: Partial<T>
  ): string {
    return Object.keys(where)
      .filter((key) => where[key] !== undefined)
      .map((key) => {
        const value = where[key];
        const columnName = tableAlias
          ? `${tableAlias}.${String(key)}`
          : String(key);

        if (this.isDate(value)) {
          return `${columnName} = '${value.toISOString()}'`;
        }
        return `${columnName} = ${
          typeof value === "string" ? `'${this.escapeString(value)}'` : value
        }`;
      })
      .join(" AND ");
  }

  private buildOrWhereClause(
    tableAlias: string,
    conditions: Partial<T>[]
  ): string {
    const orClauses = conditions.map(
      (condition) => `(${this.buildWhereClause(tableAlias, condition)})`
    );
    return orClauses.join(" OR ");
  }

  private buildWhereInClause(
    tableAlias: string,
    whereIn: { [K in keyof T]?: any[] }
  ): string {
    return Object.keys(whereIn)
      .filter((key) => whereIn[key] && whereIn[key]!.length > 0)
      .map((key) => {
        const values = whereIn[key]!.map((value) =>
          typeof value === "string" ? `'${value}'` : value
        ).join(", ");
        return `${tableAlias}.${String(key)} IN (${values})`;
      })
      .join(" AND ");
  }

  private buildComparisonClause(
    tableAlias: string,
    comparison: Partial<T>,
    operator: string
  ): string {
    return Object.keys(comparison)
      .filter((key) => comparison[key] !== undefined)
      .map((key) => {
        const value = comparison[key];
        if (this.isDate(value)) {
          return `${tableAlias}.${String(
            key
          )} ${operator} '${value.toISOString()}'`;
        }
        return `${tableAlias}.${String(key)} ${operator} ${
          typeof value === "string" ? `'${this.escapeString(value)}'` : value
        }`;
      })
      .join(" AND ");
  }

  private buildLikeClause(tableAlias: string, like: Partial<T>): string {
    return Object.keys(like)
      .filter((key) => like[key] !== undefined)
      .map(
        (key) =>
          `LOWER(${tableAlias}.${String(key)}) LIKE LOWER(${
            typeof like[key] === "string"
              ? `'%${this.escapeString(like[key] as string)}%'`
              : like[key]
          })`
      )
      .join(" AND ");
  }

  private buildJoinClause(join?: { table: string; on: string }): string {
    return join
      ? `JOIN \`${this.datasetId.split(".")[0]}.${join.table}\` ON ${join.on}`
      : "";
  }

  private buildGroupByClause(
    tableAlias: string,
    groupBy?: (keyof T)[]
  ): string {
    return groupBy
      ? `GROUP BY ${groupBy
          .map((col) => `${tableAlias}.${String(col)}`)
          .join(", ")}`
      : "";
  }

  private buildOrderByClause(
    tableAlias: string,
    orderBy?: { column: keyof T; direction: "ASC" | "DESC" }
  ): string {
    return orderBy
      ? `ORDER BY ${tableAlias}.${String(orderBy.column)} ${orderBy.direction}`
      : "";
  }

  private buildQueryWithIncludes(
    query: string,
    tableAlias: string,
    include: { [K in keyof T]?: IncludeOptions<T[K]> },
    distinctClause: string,
    selectColumns: string,
    whereClause: string,
    groupByClause: string,
    orderByClause: string,
    limitClause: string,
    offsetClause: string
  ): string {
    const includeClauses = Object.entries(include).map(([alias, options]) => {
      const { table, on } = options!.join;
      const modifiedOn = on.replace(new RegExp(`\\b${table}\\b`, "g"), alias);
      return `LEFT JOIN \`${
        this.datasetId.split(".")[0]
      }.${table}\` AS ${alias} ON ${modifiedOn}`;
    });

    const includeColumns = Object.entries(include)
      .map(([alias, options]) => {
        const includeTable = options!.join.table;
        const schema = BigqueryShemas.getSchema(includeTable).fields;
        return schema
          .map((field) => `${alias}.${field.name} AS ${alias}_${field.name}`)
          .join(", ");
      })
      .join(", ");

    return `
      SELECT ${distinctClause} ${selectColumns}, ${includeColumns}
      FROM \`${this.datasetId}\` AS ${tableAlias}
      ${includeClauses.join(" ")}
      ${whereClause}
      ${groupByClause}
      ${orderByClause}
      ${limitClause}
      ${offsetClause}
    `;
  }

  private buildUpdateQuery(props: UpdateProps<T>): string {
    const { data, where } = props;
    const setClause = this.buildSetClause(data);
    const whereClause = this.buildWhereClause(null, where);
    return `
      UPDATE \`${this.datasetId}\`
      SET ${setClause}
      WHERE ${whereClause}
    `;
  }

  private buildSetClause(data: Partial<T>): string {
    return Object.entries(data)
      .map(([key, value]) => {
        if (this.isDate(value)) {
          return `${key} = '${value.toISOString()}'`;
        }
        if (typeof value === "string") {
          return `${key} = '${value.replace(/'/g, "''")}'`;
        }
        return `${key} = ${value}`;
      })
      .join(", ");
  }

  private buildDeleteQuery(where: Partial<T>): string {
    const whereClause = this.buildWhereClause(null, where);
    return `
      DELETE FROM \`${this.datasetId}\`
      WHERE ${whereClause}
    `;
  }

  private async getTableSchema(table?: string) {
    if (!table) table = this.datasetId.split(".")[1];
    return BigqueryShemas.getSchema(table).fields;
  }

  private async processQueryResults(
    rows: any[],
    include?: { [K in keyof T]?: IncludeOptions<T[K]> }
  ): Promise<T[]> {
    const mainSchema = await this.getTableSchema();
    const includeSchemas: Record<string, any[]> = {};

    if (include) {
      for (const [alias, options] of Object.entries(include)) {
        const relatedSchema = await this.getTableSchema(options!.join.table);
        includeSchemas[alias] = relatedSchema;
      }
    }

    return this.convertRows(rows, mainSchema, includeSchemas);
  }

  private async convertRows(
    rows: any[],
    mainSchema: any[],
    includeSchemas: Record<string, any[]> = {}
  ): Promise<T[]> {
    return rows.map((row) => {
      const convertedRow = {} as T;

      this.convertMainColumns(convertedRow, row, mainSchema);
      this.convertIncludedColumns(convertedRow, row, includeSchemas);

      return convertedRow;
    });
  }

  private convertMainColumns(
    convertedRow: T,
    row: any,
    mainSchema: any[]
  ): void {
    for (const field of mainSchema) {
      const fieldName = field.name;
      const fieldType = field.type;
      let value = row[fieldName];

      value = this.convertValue(value, fieldType);
      convertedRow[fieldName as keyof T] = value;
    }
  }

  private convertIncludedColumns(
    convertedRow: T,
    row: any,
    includeSchemas: Record<string, any[]>
  ): void {
    for (const [alias, schema] of Object.entries(includeSchemas)) {
      const convertedRelatedData = {} as Record<string, any>;
      let hasData = false;

      schema.forEach((field) => {
        const originalFieldName = field.name;
        const bigQueryFieldName = `${alias}_${originalFieldName}`;
        let value = row[bigQueryFieldName];

        if (value !== undefined) {
          value = this.convertValue(value, field.type);
          convertedRelatedData[originalFieldName] = value;
          hasData = true;
        }
      });

      convertedRow[alias as keyof T] = (
        hasData ? convertedRelatedData : null
      ) as T[keyof T];
    }
  }

  private convertValue(value: any, fieldType: string): any {
    if (value === null || value === undefined) {
      return null;
    }
    switch (fieldType) {
      case "INTEGER":
      case "BIGNUMERIC":
        return typeof value === "object" && value.hasOwnProperty("value")
          ? Number(value.value)
          : Number(value);
      case "FLOAT":
      case "NUMERIC":
        return parseFloat(value);
      case "DATE":
      case "TIMESTAMP":
      case "DATETIME":
        return new Date(value.value || value);
      case "BOOLEAN":
        return Boolean(value);
      default:
        return value;
    }
  }

  private isDate(value: unknown): value is Date {
    return value instanceof Date;
  }
}
