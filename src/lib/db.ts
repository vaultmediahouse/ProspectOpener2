import { Pool, type PoolClient, type QueryResultRow } from "pg";

declare global {
  var vaultPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

export const db = connectionString
  ? global.vaultPool ?? new Pool({ connectionString, max: 5, idleTimeoutMillis: 10_000 })
  : null;

if (db && process.env.NODE_ENV !== "production") global.vaultPool = db;

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  if (!db) throw new Error("DATABASE_URL is not configured");
  return db.query<T>(text, values);
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  if (!db) throw new Error("DATABASE_URL is not configured");
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
