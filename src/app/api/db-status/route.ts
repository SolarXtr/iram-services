import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { isMock } from '@/lib/apiDb';

export const runtime = 'edge';

export async function GET() {
  const start = Date.now();
  
  if (isMock) {
    return NextResponse.json({
      status: 'success',
      isMock: true,
      connectionType: 'Mock JSON Database (In-Memory)',
      host: 'Localhost (Mock)',
      databaseName: 'mock-db.json',
      latencyMs: Date.now() - start,
      dbVersion: 'MockDB Engine v1.0',
      dbTime: new Date().toISOString(),
      maskedConnectionString: 'mock://localhost/mock-db.json',
    });
  }

  let hyperdriveStr = null;

  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const ctx = getRequestContext();
    if (ctx && ctx.env && (ctx.env as any).HYPERDRIVE) {
      hyperdriveStr = (ctx.env as any).HYPERDRIVE.connectionString || (ctx.env as any).HYPERDRIVE;
    }
  } catch (e) {
    // Fail silently when not in Cloudflare environment
  }

  const dbUrlStr = process.env.DATABASE_URL;
  const rawConnStr = hyperdriveStr || dbUrlStr || '';
  
  let connectionType = 'Direct PostgreSQL (Cloud SQL)';
  if (hyperdriveStr) {
    connectionType = 'Cloudflare Hyperdrive (Proxy)';
  } else if (!dbUrlStr) {
    connectionType = 'None (Not Configured)';
  }
  
  let maskedConnStr = '';
  let host = '';
  let dbName = '';
  
  if (rawConnStr) {
    try {
      // Handle different formats
      const cleanStr = rawConnStr.startsWith('postgresql://') || rawConnStr.startsWith('postgres://') 
        ? rawConnStr 
        : `postgresql://${rawConnStr}`;
      const parsedUrl = new URL(cleanStr);
      host = parsedUrl.host;
      dbName = parsedUrl.pathname.replace(/^\//, '').split('?')[0];
      maskedConnStr = `${parsedUrl.protocol}//${parsedUrl.username}:******@${parsedUrl.host}${parsedUrl.pathname.split('?')[0]}`;
    } catch (e) {
      maskedConnStr = 'Unparseable Connection String';
    }
  }

  try {
    const res = await dbQuery('SELECT version(), NOW()');
    const latency = Date.now() - start;
    
    return NextResponse.json({
      status: 'success',
      isMock: false,
      connectionType,
      host,
      databaseName: dbName,
      latencyMs: latency,
      dbVersion: res.rows[0].version,
      dbTime: res.rows[0].now,
      maskedConnectionString: maskedConnStr,
    });
  } catch (err: any) {
    const latency = Date.now() - start;
    return NextResponse.json({
      status: 'error',
      isMock: true,
      connectionType,
      host,
      databaseName: dbName,
      latencyMs: latency,
      error: err.message || err.toString(),
      maskedConnectionString: maskedConnStr,
    });
  }
}

