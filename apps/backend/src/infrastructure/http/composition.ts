import { PrismaClient } from '../../generated/prisma/client.js';
import { AppOptions } from './app.js';
import { PrismaStockRepository } from '../stock/repositories/PrismaStockRepository.js';
import { PrismaUserRepository } from '../auth/repositories/PrismaUserRepository.js';
import { PrismaRemanenteQueryRepository } from '../kitchen/repositories/PrismaRemanenteQueryRepository.js';
import { PrismaReportRepository } from '../reports/repositories/PrismaReportRepository.js';
import { PrismaRecipeRepository } from '../recipes/repositories/PrismaRecipeRepository.js';
import { PrismaRecipePreparationRepository } from '../kitchen/repositories/PrismaRecipePreparationRepository.js';
import { PrismaShiftReconciliationRepository } from '../kitchen/repositories/PrismaShiftReconciliationRepository.js';
import { PrismaStockMovementQueryRepository } from '../stock/repositories/PrismaStockMovementQueryRepository.js';
import { PrismaRoleRepository } from '../security/repositories/PrismaRoleRepository.js';
import { PrismaLocationRepository } from '../stock/repositories/PrismaLocationRepository.js';
import { PrismaSettingsRepository } from '../settings/repositories/PrismaSettingsRepository.js';
import { PrismaConsumptionReasonRepository } from '../kitchen/repositories/PrismaConsumptionReasonRepository.js';
import { PrismaTemperatureLogRepository } from '../kitchen/repositories/PrismaTemperatureLogRepository.js';
import { PrismaAiConfigurationRepository } from '../settings/repositories/PrismaAiConfigurationRepository.js';

/**
 * Composición root real de infraestructura: fuera de "production" no fuerza nada (createApp
 * mantiene sus defaults InMemory, útiles para desarrollo rápido y tests). En "production"
 * instancia todos los repositorios reales respaldados por PostgreSQL y Prisma.
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
    recipePreparationRepository: new PrismaRecipePreparationRepository(prisma),
    roleRepository: new PrismaRoleRepository(prisma),
    locationRepository: new PrismaLocationRepository(prisma),
    settingsRepository: new PrismaSettingsRepository(prisma),
    aiConfigRepository: new PrismaAiConfigurationRepository(prisma),
    consumptionReasonRepository: new PrismaConsumptionReasonRepository(prisma),
    temperatureLogRepository: new PrismaTemperatureLogRepository(prisma),
  };
}

