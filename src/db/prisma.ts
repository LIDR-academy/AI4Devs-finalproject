import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Cliente Prisma (singleton). Prisma 7 usa driver adapters: la conexión se pasa por
 * `@prisma/adapter-pg` (la URL vive en prisma.config.ts / DATABASE_URL, ADR-0001 §5).
 *
 * En dev se cachea en `globalThis` para no abrir un pool nuevo con cada HMR.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
