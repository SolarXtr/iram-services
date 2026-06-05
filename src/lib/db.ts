const connectionString = process.env.DATABASE_URL;
const isMock = !connectionString || 
               connectionString.includes('localhost:51213') || 
               connectionString.startsWith('prisma+postgres://') || 
               connectionString.startsWith('mock:');

let poolInstance: any = null;

async function getPool() {
  if (poolInstance) return poolInstance;
  if (!isMock && connectionString) {
    const pg = await import('pg');
    poolInstance = new pg.default.Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
    });
  }
  return poolInstance;
}

export async function dbQuery(text: string, params?: any[]) {
  const pool = await getPool();
  if (!pool) {
    throw new Error('Database pool is not initialized. Ensure DATABASE_URL is set.');
  }
  return pool.query(text, params);
}
