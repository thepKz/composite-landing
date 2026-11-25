import pg from 'pg';

const globalDatabase = globalThis as unknown as { databasePool?: pg.Pool };
export const db = globalDatabase.databasePool ?? new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.DATABASE_SSL_CA ? { ssl: { ca: process.env.DATABASE_SSL_CA.replace(/\\n/g, '\n'), rejectUnauthorized: true } } : {}),
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});
if (process.env.NODE_ENV !== 'production') globalDatabase.databasePool = db;
if (db.listenerCount('error') === 0) {
  db.on('error', () => console.error('Database idle connection lost. The pool will reconnect on the next request.'));
}

export async function transaction<T>(work: (client: pg.PoolClient) => Promise<T>) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
