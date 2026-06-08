import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const debugInfo: any = {
    processEnvKeys: Object.keys(process.env),
    processEnvDatabaseUrlExists: !!process.env.DATABASE_URL,
    processEnvHyperdriveExists: !!process.env.HYPERDRIVE,
    processEnvHyperdriveType: typeof process.env.HYPERDRIVE,
  };

  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const ctx = getRequestContext();
    debugInfo.hasRequestContext = !!ctx;
    if (ctx) {
      debugInfo.hasEnv = !!ctx.env;
      if (ctx.env) {
        debugInfo.envKeys = Object.keys(ctx.env);
        debugInfo.hyperdriveBindingExists = !!ctx.env.HYPERDRIVE;
        debugInfo.hyperdriveBindingType = typeof ctx.env.HYPERDRIVE;
        if (ctx.env.HYPERDRIVE) {
          debugInfo.hyperdriveConnectionStringExists = !!ctx.env.HYPERDRIVE.connectionString;
        }
      }
    }
  } catch (e: any) {
    debugInfo.requestContextError = e.message || e.toString();
  }

  return NextResponse.json(debugInfo);
}
