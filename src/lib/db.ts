import 'server-only';
import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl } from '@/lib/server/env';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: getDatabaseUrl(),
        },
      },
    });
  }

  return globalForPrisma.prisma;
}
