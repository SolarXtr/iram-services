let poolPromise: Promise<any> | null = null;

async function getPool() {
  if (poolPromise) return poolPromise;
  
  const connectionString = process.env.HYPERDRIVE || process.env.DATABASE_URL;
  const isMock = !connectionString || 
                 connectionString.includes('localhost:51213') || 
                 connectionString.startsWith('prisma+postgres://') || 
                 connectionString.startsWith('mock:');

  poolPromise = (async () => {
    if (!isMock && connectionString) {
      const pg = await import('pg');
      return new pg.default.Pool({
        connectionString,
        max: 2,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,
      });
    }
    return null;
  })();
  
  return poolPromise;
}

export async function dbQuery(text: string, params?: any[]) {
  console.log(`[DB] Executing query: ${text.slice(0, 100)}...`);
  const start = Date.now();
  try {
    const pool = await getPool();
    if (!pool) {
      throw new Error('Database pool is not initialized. Ensure DATABASE_URL or HYPERDRIVE is set.');
    }
    const res = await pool.query(text, params);
    console.log(`[DB] Query success in ${Date.now() - start}ms`);
    return res;
  } catch (err) {
    console.error(`[DB] Query failed after ${Date.now() - start}ms:`, err);
    throw err;
  }
}
