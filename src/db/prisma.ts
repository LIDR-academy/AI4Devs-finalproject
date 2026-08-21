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

/**
 * Tamaño del pool. Se deja el de `pg` (10) salvo que el despliegue diga otra cosa,
 * porque el número correcto depende de dónde corre: en la VM hay **un** proceso y le
 * conviene un pool holgado; en serverless hay tantos pools como instancias vivas, y
 * diez conexiones por instancia agotan el límite del Postgres gestionado en cuanto hay
 * tráfico. Ahí se baja con `DATABASE_POOL_MAX`.
 */
function poolMax(): number | undefined {
  const raw = Number(process.env.DATABASE_POOL_MAX);
  return Number.isFinite(raw) && raw > 0 ? raw : undefined;
}

function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: poolMax(),
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
