/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */
import { SQL, SQLStatement } from 'sql-template-strings';
import { Service } from './index';

export type UpdateValue<T, K extends keyof T> = [K, T[K]];

export { SQLStatement } from 'sql-template-strings';

function appendSQL(statement: SQLStatement, value: any) {
  if (value instanceof SQLStatement) {
    statement.append(value);
  } else {
    statement.append(SQL`${value}`);
  }
  return statement;
}

export function sql(strings: readonly string[], ...values: any[]) {
  const result = SQL``;
  for (let i = 0; i < strings.length; i += 1) {
    result.append(strings[i]);
    if (i < values.length) {
      appendSQL(result, values[i]);
    }
  }
  return result;
}

export function join(values: any[], separator = ',') {
  const result = SQL``;
  for (let i = 0; i < values.length; i += 1) {
    if (i > 0) {
      result.append(separator);
    }
    appendSQL(result, values[i]);
  }
  return result;
}

export function insertItem(values: any[]) {
  const result = sql`(${join(values)})`;
  return result;
}

export function insertItems(values: any[][]) {
  const result = join(values.map((item) => insertItem(item)));
  return result;
}

export function insertTable(table: string | SQLStatement, fields: readonly string[], values: any[][]) {
  const result = SQL`INSERT INTO `;
  result.append(table);
  result.append(`(${fields.join(', ')}) VALUES `);
  result.append(insertItems(values));
  return result;
}

/**
 * @example
 * // return SQL`UPDATE table SET field1 = 1, field2 = 2 WHERE field3 = 3`
 * updateTable('table', { field1: 1, field2: 2 }, 'field3 = 3')
 * @example
 * // return SQL`UPDATE table SET field1 = 1, field2 = 2 WHERE field3 = 3`
 * updateTable('table', [['field1', 1], ['field2', 2]], 'field3 = 3')
 */
export function updateTable(table: string, updateObj: Record<string, any> | [string, any][], where?: string | SQLStatement) {
  const result = SQL`UPDATE `;
  result.append(`${table} SET `);
  (Array.isArray(updateObj) ? updateObj : Object.entries(updateObj)).forEach(([key, value], index) => {
    if (index > 0) {
      result.append(', ');
    }
    result.append(`${key} = `);
    appendSQL(result, value);
  });
  if (where) {
    result.append(' WHERE ');
    result.append(where);
  }
  return result;
}

export class BasicCondition<T extends Record<string, unknown>> {
  protected condition: SQLStatement[] = [];

  protected include: [keyof T & string, readonly T[keyof T][]][] = [];

  private wrapItem(field: keyof T & string, value: T[keyof T] | undefined, cond: string) {
    this.condition.push(sql``.append(`${field} ${cond} `).append(SQL`${value}`));
  }

  private wrap(field: keyof T & string | Partial<T>, value: T[keyof T] | undefined, cond: string) {
    if (typeof field === 'object') {
      Object.entries(field).forEach(([key, val]) => {
        this.wrapItem(key, val, cond);
      });
    } else {
      this.wrapItem(field, value, cond);
    }
    return this;
  }

  /**
   * @example
   * // return SQL`WHERE t = 1 AND d = 4`
   * condition.eq({ t: 1, d: 4 })._where();
   */
  eq(obj: Partial<T>): this;

  eq<K extends keyof T>(field: K & string, value: T[K]): this;

  eq(field: keyof T & string | Partial<T>, value?: T[keyof T]) {
    return this.wrap(field, value, '=');
  }

  ne(obj: Partial<T>): this;

  ne<K extends keyof T>(field: K & string, value: T[K]): this;

  ne(field: keyof T & string | Partial<T>, value?: T[keyof T]) {
    return this.wrap(field, value, '<>');
  }

  lt(obj: Partial<T>): this;

  lt<K extends keyof T>(field: K & string, value: T[K]): this;

  lt(field: keyof T & string | Partial<T>, value?: T[keyof T]) {
    return this.wrap(field, value, '<');
  }

  gt(obj: Partial<T>): this;

  gt<K extends keyof T>(field: K & string, value: T[K]): this;

  gt(field: keyof T & string | Partial<T>, value?: T[keyof T]) {
    return this.wrap(field, value, '>');
  }

  le(obj: Partial<T>): this;

  le<K extends keyof T>(field: K & string, value: T[K]): this;

  le(field: keyof T & string | Partial<T>, value?: T[keyof T]) {
    return this.wrap(field, value, '<=');
  }

  ge(obj: Partial<T>): this;

  ge<K extends keyof T>(field: K & string, value: T[K]): this;

  ge(field: keyof T & string | Partial<T>, value?: T[keyof T]) {
    return this.wrap(field, value, '>=');
  }

  in(obj: { [P in keyof T]?: readonly T[P][] }): this;

  in<K extends keyof T>(field: K & string, value: readonly T[K][]): this;

  in(field: keyof T & string | { [P in keyof T]?: readonly T[P][] }, values?: readonly T[keyof T][]) {
    if (typeof field === 'object') {
      Object.entries(field).forEach(([key, val]) => {
        this.include.push([key, val]);
      });
    } else if (!values) {
      throw new Error('values is required');
    } else {
      this.include.push([field, values]);
    }
    return this;
  }

  like(obj: Partial<T>): this;

  like<K extends keyof T>(field: K & string, value: T[K]): this;

  like(field: keyof T & string | Partial<T>, value?: T[keyof T]) {
    return this.wrap(field, value, 'LIKE');
  }

  where(condition: string | SQLStatement | BasicCondition<T>) {
    if (condition instanceof BasicCondition) {
      this.condition.push(...condition.condition);
      this.include.push(...condition.include);
      return this;
    }
    this.condition.push(condition instanceof SQLStatement ? condition : SQL``.append(condition));
    return this;
  }

  protected _where() {
    const query = SQL``;
    if (this.condition.length > 0) {
      query.append(' WHERE ');
      query.append(join(this.condition, ' AND '));
    }
    if (this.include.length === 0) {
      return {
        sql: query,
        pg: query
      };
    }
    if (this.condition.length > 0) {
      query.append(' AND ');
    } else {
      query.append(' WHERE ');
    }
    const queryPg = SQL``.append(query);
    query.append(join(this.include.map(([field, values]) => sql``.append(field).append(SQL` IN (${values})`)), ' AND '));
    queryPg.append(join(this.include.map(([field, values]) => sql``.append(field).append(SQL` IN (${values})`)), ' AND '));
    return {
      sql: query,
      pg: queryPg
    };
  }
}

class QueryBuilder<T extends Record<string, unknown>, K extends Record<string, unknown>> extends BasicCondition<T> {
  protected _limit?: number;

  protected groupBy: string[] = [];

  protected orderBy: string[] = [];

  constructor(protected table: string, protected fields: (keyof K)[]) {
    super();
  }

  limit(limit: number) {
    this._limit = limit;
    return this;
  }

  group(...groups: (keyof T & string)[]) {
    this.groupBy.push(...groups);
    return this;
  }

  order(...orders: ((keyof T & string) | `"${keyof T & string}"` | `${keyof T & string} DESC` | `${keyof T & string} ASC`)[]) {
    this.orderBy.push(...orders);
    return this;
  }

  build(): Pick<SQLStatement, 'sql' | 'text' | 'values'> {
    const query = SQL`SELECT `.append(this.fields.join(',')).append(' FROM ').append(this.table);
    const where = super._where();
    const tail = SQL``;
    if (this.groupBy.length > 0) {
      tail.append(' GROUP BY ');
      tail.append(this.groupBy.join(','));
    }
    if (this.orderBy.length > 0) {
      tail.append(' ORDER BY ');
      tail.append(this.orderBy.join(','));
    }
    if (this._limit) {
      tail.append(SQL` LIMIT ${this._limit}`);
    }
    const queryPg = SQL``.append(query);
    query.append(where.sql).append(tail);
    queryPg.append(where.pg).append(tail);
    return {
      sql: query.sql,
      text: queryPg.text,
      values: query.values
    };
  }

  query(service: Service): Promise<K[]>;
  query<M = K>(service: Service, wrapper: (d: K) => M): Promise<M[]>;
  query<M = K>(service: Service, wrapper?: (d: K) => M): Promise<K[] | M[]> {
    const query = this.build();
    return service.db.query<K>(query).then((data) => {
      if (wrapper) {
        return data.map(wrapper);
      }
      return data;
    });
  }
}

class DeleteBuilder<T extends Record<string, unknown>> extends BasicCondition<T> {
  constructor(protected table: string) {
    super();
  }

  build(): Pick<SQLStatement, 'sql' | 'text' | 'values'> {
    const query = SQL`DELETE FROM `.append(this.table);
    const where = super._where();
    const queryPg = SQL``.append(query);
    query.append(where.sql);
    queryPg.append(where.pg);
    return {
      sql: query.sql,
      text: queryPg.text,
      values: query.values
    };
  }

  query(service: Service): Promise<true> {
    const query = this.build();
    return service.db.query(query).then(() => true);
  }
}

class UpdateBuilder<T extends Record<string, unknown>> extends BasicCondition<T> {
  protected values: UpdateValue<T, keyof T>[] = [];

  constructor(protected table: string) {
    super();
  }

  set(fields: UpdateValue<T, keyof T>[]): this;

  set<K extends keyof T>(field: K, value: T[K]): this;

  set(field: (keyof T & string) | UpdateValue<T, keyof T>[], value?: T[keyof T]) {
    if (Array.isArray(field)) {
      this.values.push(...field);
    } else if (!value) {
      throw new Error('value is required');
    } else {
      this.values.push([field, value]);
    }
    return this;
  }

  build(): Pick<SQLStatement, 'sql' | 'text' | 'values'> {
    const query = updateTable(this.table, this.values);
    const where = super._where();
    const queryPg = SQL``.append(query).append(where.pg);
    return {
      sql: query.append(where.sql).sql,
      text: queryPg.text,
      values: queryPg.values
    };
  }

  query(service: Service) {
    const query = updateTable(this.table, this.values);
    const where = super._where();
    query.append(where.pg);
    query.append(' RETURNING *');
    return service.db.query<T>(query);
  }
}

class InsertBuilderValues<T extends Record<string, unknown>, K extends readonly (keyof T & string)[]> {
  protected values: any[] = [];

  constructor(protected table: string, protected _fields: K) {}

  item(item: T[K[number]][]) {
    this.values.push(item);
    return this;
  }

  items(items: T[K[number]][][]) {
    this.values.push(...items);
    return this;
  }

  build(): Pick<SQLStatement, 'sql' | 'text' | 'values'> {
    const query = insertTable(this.table, this._fields, this.values);
    return query;
  }

  query(service: Service) {
    const query = insertTable(this.table, this._fields, this.values);
    query.append(' RETURNING *');
    return service.db.query<T>(query);
  }
}

class InsertBuilder<T extends Record<string, unknown>> {
  constructor(protected table: string) {}

  fields<K extends readonly(keyof T & string)[]>(fields: K) {
    return new InsertBuilderValues<T, K>(this.table, fields);
  }
}

export function builder<T extends Record<string, unknown>>(table: string, fields: (keyof T | `"${keyof T & string}"`)[]) {
  return {
    select: <K extends keyof T>(...fieldsOv: K[]) => {
      return new QueryBuilder<T, Pick<T, K>>(table, fieldsOv);
    },
    selectAll: () => {
      return new QueryBuilder<T, T>(table, fields);
    },
    delete: () => {
      return new DeleteBuilder<T>(table);
    },
    update: () => {
      return new UpdateBuilder<T>(table);
    },
    insert: () => {
      return new InsertBuilder<T>(table);
    },
    condition: () => {
      return new BasicCondition<T>();
    }
  };
}

export default {
  builder,
  sql,
  appendSQL,
  join,
  insertItem,
  insertItems,
  insertTable,
  updateTable,
  BasicCondition
}