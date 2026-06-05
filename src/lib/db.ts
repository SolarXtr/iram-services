import type { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
const isMock = !connectionString || 
               connectionString.includes('localhost:51213') || 
               connectionString.startsWith('prisma+postgres://') || 
               connectionString.startsWith('mock:');

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

let prismaInstance: any = null;

async function getPrisma() {
  if (prismaInstance) return prismaInstance;

  if (!isMock && connectionString) {
    // Dynamic import to avoid loading pg on Edge compiler during build/mock mode
    const pg = await import('pg');
    const { PrismaPg } = await import('@prisma/adapter-pg');
    
    // Dynamically choose PrismaClient based on runtime
    let PrismaClientConstructor;
    const isEdge = process.env.NEXT_RUNTIME === 'edge' || 
                   typeof EdgeRuntime === 'string' || 
                   typeof require === 'undefined';
    
    if (isEdge) {
      // Use eval('import') to prevent the bundler from trying to package Prisma WASM on Edge
      const edgeModule = await eval("import('@prisma/client/edge')");
      PrismaClientConstructor = edgeModule.PrismaClient;
    } else {
      // Use eval('require') to prevent the bundler from packaging the Node.js client on the Edge
      const nodeModule = eval("require")('@prisma/client');
      PrismaClientConstructor = nodeModule.PrismaClient;
    }
    
    const pool = new pg.default.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    prismaInstance = globalForPrisma.prisma ?? new PrismaClientConstructor({ 
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    });
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance;
    }
  }
  return prismaInstance;
}

// Export a Proxy client that lazily forwards operations to the dynamic Prisma instance.
// During mock mode, this proxy is never called because apiDb routes queries to mockDb instead.
export const db = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (typeof prop === 'string') {
      return new Proxy({}, {
        get(subTarget, subProp) {
          if (typeof subProp === 'string') {
            return async (...args: any[]) => {
              const client = await getPrisma();
              if (!client) {
                throw new Error('Prisma database is not initialized. Ensure DATABASE_URL is set.');
              }
              return (client as any)[prop][subProp](...args);
            };
          }
        }
      });
    }
  }
});
