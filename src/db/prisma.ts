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
 * conviene un pool holgado; en serverless hay tantos pools como instancias vivas.
 *
 * Ahí el valor es **1**, y la razón no es la que parece. No es que falten conexiones
 * durante el pico: el techo del pooler es este número **por el de instancias vivas**, y
 * una instancia congelada **no ejecuta temporizadores**, de modo que el
 * `idleTimeoutMillis` de `pg` (30 s) nunca llega a cerrar nada y el hueco sigue tomado
 * hasta que el proveedor la recicla. Con un pool de 1 la huella de cada instancia es una
 * conexión en vez de tres, y de paso los `Promise.all` de las pantallas se serializan
 * solos —el coste, medido contra el despliegue, se pierde en el ruido de la red—.
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
