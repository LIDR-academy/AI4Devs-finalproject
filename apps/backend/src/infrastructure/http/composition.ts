import { PrismaClient } from '../../generated/prisma/client.js';
import { AppOptions } from './app.js';
import { PrismaStockRepository } from '../stock/repositories/PrismaStockRepository.js';
import { PrismaUserRepository } from '../auth/repositories/PrismaUserRepository.js';
import { PrismaRemanenteQueryRepository } from '../kitchen/repositories/PrismaRemanenteQueryRepository.js';
import { PrismaReportRepository } from '../reports/repositories/PrismaReportRepository.js';
import { PrismaRecipeRepository } from '../recipes/repositories/PrismaRecipeRepository.js';
import { PrismaShiftReconciliationRepository } from '../kitchen/repositories/PrismaShiftReconciliationRepository.js';
import { PrismaStockMovementQueryRepository } from '../stock/repositories/PrismaStockMovementQueryRepository.js';

/**
 * Antes de este fix, server.ts llamaba createApp() sin argumentos, y cada
 * repositorio caía en su default InMemory sin importar NODE_ENV — el backend
 * de producción nunca tocaba PostgreSQL. Esta función es la composición root
 * real: fuera de "production" no fuerza nada (createApp mantiene sus defaults
 * InMemory, útiles para desarrollo rápido). En "production" instancia las
 * 6 repositories Prisma existentes (TK-048 añade report/recipes/reconciliation,
 * cerrando la brecha de persistencia parcial).
 */
export function buildRepositoriesForEnvironment(
  nodeEnv: string | undefined,
  prisma: PrismaClient
): Partial<AppOptions> {
  if (nodeEnv !== 'production') {
    return {};
  }

  return {
    userRepository: new PrismaUserRepository(prisma),
    stockRepository: new PrismaStockRepository(prisma),
    stockMovementQueryRepository: new PrismaStockMovementQueryRepository(prisma),
    remanenteQueryRepository: new PrismaRemanenteQueryRepository(prisma),
    reportRepository: new PrismaReportRepository(prisma),
    recipeRepository: new PrismaRecipeRepository(prisma),
    reconciliationRepository: new PrismaShiftReconciliationRepository(prisma),
  };
}
