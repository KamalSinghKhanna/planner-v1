import { Pool, PoolClient, QueryResult } from "pg";
import { env } from "../config/env";

const pool = new Pool({
  connectionString: env.DATABASE_URL
});

pool.on("error", (error) => {
  console.error("[db] Unexpected error on idle client", error);
});

export const query = <T = unknown>(text: string, params?: unknown[]): Promise<QueryResult<T>> =>
  pool.query(text, params);

export const getClient = (): Promise<PoolClient> => pool.connect();

export default pool;
