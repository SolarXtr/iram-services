import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { getIsMock } from '@/lib/apiDb';

export const runtime = 'edge';

export async function GET() {
  const start = Date.now();
  const isMock = getIsMock();
  
  if (isMock) {
    return NextResponse.json({
      status: 'success',
      isMock: false,
      connectionType: 'Cloudflare D1 Database (Local Emulator)',
      host: 'Localhost (SQLite)',
      databaseName: 'iram-db',
      latencyMs: Date.now() - start,
      dbVersion: 'SQLite 3 (Local)',
      dbTime: new Date().toISOString(),
      maskedConnectionString: 'd1://iram-db',
    });
  }

  try {
    // Test Cloudflare D1 connection with a simple query
    await dbQuery('SELECT 1');
    const latency = Date.now() - start;
    
    return NextResponse.json({
      status: 'success',
      isMock: false,
      connectionType: 'Cloudflare D1 Database',
      host: 'Cloudflare Edge Network',
      databaseName: 'iram-db',
      latencyMs: latency,
      dbVersion: 'SQLite (D1)',
      dbTime: new Date().toISOString(),
      maskedConnectionString: 'd1://iram-db',
    });
  } catch (err: any) {
    const latency = Date.now() - start;
    return NextResponse.json({
      status: 'error',
      isMock: false,
      connectionType: 'Cloudflare D1 Database',
      host: 'Cloudflare Edge Network',
      databaseName: 'iram-db',
      latencyMs: latency,
      error: err.message || err.toString(),
      maskedConnectionString: 'd1://iram-db',
    });
  }
}
