import { PrismaClient } from '@prisma/client';
import { AppOptions } from './app.js';
import { PrismaStockRepository } from '../stock/repositories/PrismaStockRepository.js';
import { PrismaUserRepository } from '../auth/repositories/PrismaUserRepository.js';
import { PrismaRemanenteQueryRepository } from '../kitchen/repositories/PrismaRemanenteQueryRepository.js';

/**
 * Antes de este fix, server.ts llamaba createApp() sin argumentos, y cada
 * repositorio caía en su default InMemory sin importar NODE_ENV — el backend
 * de producción nunca tocaba PostgreSQL. Esta función es la composición root
 * real: fuera de "production" no fuerza nada (createApp mantiene sus defaults
 * InMemory, útiles para desarrollo rápido). En "production" instancia las
 * únicas 3 repositories Prisma que existen hoy en el código.
 *
 * report/recipe/reconciliation NO tienen implementación Prisma todavía — se
 * advierte explícitamente en el arranque en vez de fallar en silencio, para
 * que el gap quede visible y accionable como su propio ticket futuro.
 */
export function buildRepositoriesForEnvironment(
  nodeEnv: string | undefined,
  prisma: PrismaClient
): Partial<AppOptions> {
  if (nodeEnv !== 'production') {
    return {};
  }

  console.warn(
    '⚠️  PERSISTENCIA PARCIAL EN PRODUCCIÓN: reportRepository, recipeRepository y ' +
    'reconciliationRepository no tienen implementación Prisma todavía y seguirán ' +
    'usando almacenamiento en memoria (se pierde su estado en cada reinicio).'
  );

  return {
    userRepository: new PrismaUserRepository(prisma),
    stockRepository: new PrismaStockRepository(prisma),
    remanenteQueryRepository: new PrismaRemanenteQueryRepository(prisma),
  };
}
