import { PrismaClient } from '@prisma/client';
import inMemoryDb from './inMemoryDb';

const isProductionCloud = process.env.RENDER || process.env.NODE_ENV === 'production';
const hasRealRemoteDb = process.env.DATABASE_URL && 
  !process.env.DATABASE_URL.includes('localhost') && 
  !process.env.DATABASE_URL.includes('127.0.0.1') &&
  process.env.DATABASE_URL.startsWith('postgres');

let prismaClient: PrismaClient = inMemoryDb as any;

// If we are in demo mode, or on Render without an external cloud database, run 100% database-free!
if (process.env.DEMO_MODE === 'true' || !process.env.DATABASE_URL || (isProductionCloud && !hasRealRemoteDb)) {
  console.log('⚡ [Dastaan Server] Running in In-Memory Demonstration Mode — Zero External Database Required!');
  prismaClient = inMemoryDb as any;
} else {
  try {
    const realPrisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

    // Proxy wrapper that falls back to inMemoryDb if database is unreachable
    prismaClient = new Proxy(realPrisma, {
      get(target: any, prop: string) {
        if (prop in target) {
          const original = target[prop];
          if (typeof original === 'object' && original !== null) {
            return new Proxy(original, {
              get(subTarget: any, subProp: string) {
                if (typeof subTarget[subProp] === 'function') {
                  return async (...args: any[]) => {
                    try {
                      return await subTarget[subProp](...args);
                    } catch (err: any) {
                      // If database connection error (P1001, etc.), fallback to in-memory store
                      if (err?.code?.startsWith('P1') || err?.message?.includes('database server')) {
                        console.warn(`[Dastaan Server] Database unreachable (${err.code}). Serving ${prop}.${subProp} from In-Memory store.`);
                        if (inMemoryDb[prop] && typeof inMemoryDb[prop][subProp] === 'function') {
                          return inMemoryDb[prop][subProp](...args);
                        }
                      }
                      throw err;
                    }
                  };
                }
                return subTarget[subProp];
              },
            });
          }
          return original;
        }
        return inMemoryDb[prop];
      },
    });
  } catch (err) {
    console.warn('⚠️ [Dastaan Server] Failed to initialize Prisma, falling back to In-Memory DB:', err);
    prismaClient = inMemoryDb;
  }
}

export default prismaClient;
