import { Pool, QueryConfig, QueryResultRow } from 'pg';

export class Postgres {
  private static instance: Postgres;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PASSWORD,
      port: Number(process.env.PG_PORT),
    });
  }

  public static getInstance(): Postgres {
    if (!Postgres.instance) {
      Postgres.instance = new Postgres();
    }
    return Postgres.instance;
  }

  public async query<R extends QueryResultRow = any, I extends any[] = any[]>(query: QueryConfig<I>): Promise<R[]> {
    const client = await this.pool.connect();
    try {
      const res = await client.query(query);
      return res.rows;
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  }
}