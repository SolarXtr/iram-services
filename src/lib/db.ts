export async function dbQuery(text: string, params?: any[]) {
  console.log(`[D1 DB] Executing query: ${text.slice(0, 100)}...`);
  const start = Date.now();
  
  // Try to fetch Cloudflare D1 database context
  let d1: any = null;
  try {
    let ctx: any = null;
    try {
      const { getRequestContext } = await import('@cloudflare/next-on-pages');
      ctx = getRequestContext();
    } catch (e) {
      // Ignore
    }
    if (!ctx) {
      const symbol = Symbol.for('__cloudflare-request-context__');
      ctx = (globalThis as any)[symbol];
    }
    if (ctx && ctx.env && (ctx.env as any).DB) {
      d1 = (ctx.env as any).DB;
    }
  } catch (e) {
    // Fail silently when not in Cloudflare environment
  }

  if (!d1) {
    throw new Error('Cloudflare D1 is not available. Please run in Cloudflare Pages/Workers environment.');
  }

  // Convert PostgreSQL parameters ($1, $2) to SQLite parameter format (?1, ?2)
  const sqliteSql = text.replace(/\$(\d+)/g, '?$1');
  
  const statement = d1.prepare(sqliteSql);
  const boundStatement = params && params.length > 0 ? statement.bind(...params) : statement;
  const result = await boundStatement.all();
  
  console.log(`[D1 DB] Query success in ${Date.now() - start}ms`);
  return {
    rows: result.results || []
  };
}
