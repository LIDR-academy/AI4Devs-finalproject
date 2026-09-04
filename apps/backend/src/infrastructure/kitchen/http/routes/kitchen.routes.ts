import { Router } from 'express';
import { KitchenController } from '../controllers/kitchen.controller.js';
import { GetActiveRemanentesUseCase } from '../../../../application/kitchen/use-cases/GetActiveRemanentesUseCase.js';
import { ConsumeRemanenteUseCase } from '../../../../application/kitchen/use-cases/ConsumeRemanenteUseCase.js';
import { DiscardRemanenteUseCase } from '../../../../application/kitchen/use-cases/DiscardRemanenteUseCase.js';
import { ConsumeRecipeUseCase } from '../../../../application/kitchen/use-cases/ConsumeRecipeUseCase.js';
import { GetRecipePreparationsUseCase } from '../../../../application/kitchen/use-cases/GetRecipePreparationsUseCase.js';
import { ClosePreparationUseCase } from '../../../../application/kitchen/use-cases/ClosePreparationUseCase.js';
import { AbandonPreparationUseCase } from '../../../../application/kitchen/use-cases/AbandonPreparationUseCase.js';
import { IRemanenteQueryRepository } from '../../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IRemanenteRepository } from '../../../../domain/stock/repositories/IRemanenteRepository.js';
import { IStockUnitOfWork } from '../../../../domain/stock/repositories/IStockUnitOfWork.js';
import { IStorageLocationRepository } from '../../../../domain/stock/repositories/IStorageLocationRepository.js';
import { IRecipeRepository } from '../../../../domain/recipes/repositories/IRecipeRepository.js';
import { IRecipePreparationRepository } from '../../../../domain/kitchen/repositories/IRecipePreparationRepository.js';
import { IConsumptionReasonRepository } from '../../../../domain/kitchen/repositories/IConsumptionReasonRepository.js';
import { ISystemSettingsRepository } from '../../../../domain/settings/repositories/ISystemSettingsRepository.js';
import { systemClock } from '../../../shared/systemClock.js';
import { cryptoIdGenerator } from '../../../shared/cryptoIdGenerator.js';

import { PerformShiftReconciliationUseCase } from '../../../../application/kitchen/use-cases/PerformShiftReconciliationUseCase.js';
import { InMemoryShiftReconciliationRepository } from '../../repositories/InMemoryShiftReconciliationRepository.js';
import { InMemorySettingsRepository } from '../../../settings/repositories/InMemorySettingsRepository.js';

import { IShiftReconciliationRepository } from '../../../../domain/kitchen/repositories/IShiftReconciliationRepository.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';

interface PreparationCloseDeps {
  recipePreparationRepository?: IRecipePreparationRepository;
  stockUnitOfWork?: IStockUnitOfWork;
  locationRepository?: IStorageLocationRepository;
}

function buildPreparationCloseUseCases(deps: PreparationCloseDeps): {
  close?: ClosePreparationUseCase;
  abandon?: AbandonPreparationUseCase;
} {
  const { recipePreparationRepository, stockUnitOfWork, locationRepository } = deps;
  if (!recipePreparationRepository || !stockUnitOfWork || !locationRepository) {
    return {};
  }
  return {
    close: new ClosePreparationUseCase(
      recipePreparationRepository,
      locationRepository,
      stockUnitOfWork,
      systemClock,
      cryptoIdGenerator
    ),
    abandon: new AbandonPreparationUseCase(recipePreparationRepository, stockUnitOfWork, systemClock),
  };
}

// ADR-004 / TK-108 / TK-109: tanto el consumo manual como la varianza negativa de
// conciliación exigen un motivo del mismo catálogo — sin él tampoco se puede montar
// el caso de uso correspondiente (evita un 500 en runtime en vez de un 4xx claro).
function buildReasonDependentUseCases(
  remanenteRepository: IRemanenteRepository | undefined,
  remanenteQueryRepository: IRemanenteQueryRepository,
  reconciliationRepo: IShiftReconciliationRepository,
  consumptionReasonRepository: IConsumptionReasonRepository | undefined
): { consume?: ConsumeRemanenteUseCase; reconcile?: PerformShiftReconciliationUseCase } {
  if (!remanenteRepository || !consumptionReasonRepository) {
    return {};
  }
  return {
    consume: new ConsumeRemanenteUseCase(remanenteRepository, consumptionReasonRepository),
    reconcile: new PerformShiftReconciliationUseCase(
      remanenteRepository,
      remanenteQueryRepository,
      reconciliationRepo,
      consumptionReasonRepository
    ),
  };
}

function buildKitchenController(
  remanenteQueryRepository: IRemanenteQueryRepository,
  remanenteRepository?: IRemanenteRepository,
  recipeRepository?: IRecipeRepository,
  reconciliationRepository?: IShiftReconciliationRepository,
  recipePreparationRepository?: IRecipePreparationRepository,
  closeDeps: PreparationCloseDeps = {},
  consumptionReasonRepository?: IConsumptionReasonRepository,
  settingsRepository?: ISystemSettingsRepository
): KitchenController {
  const reconciliationRepo = reconciliationRepository ?? new InMemoryShiftReconciliationRepository();
  // US-017 Escenario 2 / TK-110: umbral de alerta crítica FEFO configurable — sin repo
  // explícito (tests de negocio), cae al default 24h del repo InMemory (mismo comportamiento
  // de antes del fix).
  const settingsRepo = settingsRepository ?? new InMemorySettingsRepository();
  const preparationClose = buildPreparationCloseUseCases({ ...closeDeps, recipePreparationRepository });
  const reasonDependent = buildReasonDependentUseCases(
    remanenteRepository,
    remanenteQueryRepository,
    reconciliationRepo,
    consumptionReasonRepository
  );
  return new KitchenController(
    new GetActiveRemanentesUseCase(remanenteQueryRepository, settingsRepo),
    reasonDependent.consume,
    remanenteRepository ? new DiscardRemanenteUseCase(remanenteRepository) : undefined,
    // US-029: consumo ad-hoc dentro de runAdhocConsumption (C-DEV-006-1) — necesita el
    // IStockUnitOfWork, no solo IRemanenteRepository (que ya no basta desde TK-105).
    recipeRepository && closeDeps.stockUnitOfWork
      ? new ConsumeRecipeUseCase(recipeRepository, closeDeps.stockUnitOfWork, systemClock, cryptoIdGenerator)
      : undefined,
    reasonDependent.reconcile,
    recipePreparationRepository
      ? new GetRecipePreparationsUseCase(recipePreparationRepository, remanenteQueryRepository)
      : undefined,
    preparationClose.close,
    preparationClose.abandon
  );
}

export function createKitchenRouter(
  remanenteQueryRepository: IRemanenteQueryRepository,
  remanenteRepository?: IRemanenteRepository,
  recipeRepository?: IRecipeRepository,
  reconciliationRepository?: IShiftReconciliationRepository,
  isAuthRequired = true,
  recipePreparationRepository?: IRecipePreparationRepository,
  stockUnitOfWork?: IStockUnitOfWork,
  locationRepository?: IStorageLocationRepository,
  consumptionReasonRepository?: IConsumptionReasonRepository,
  settingsRepository?: ISystemSettingsRepository
): Router {
  const router = Router();

  // TK-093 (AUDIT-SEC-001 F-3): cada ruta de mutación declara explícitamente sus roles
  // permitidos — no basta el authMiddleware heredado a nivel de mount (default-deny).
  // Los operarios de cocina ejecutan estas acciones per PRD §2.2; cuando US-015/TK-073
  // introduzca roles nuevos, sustituir por authorizePermissions('kitchen:...'). Cuando la
  // auth está desactivada (tests de negocio, requireAuth:false) el guard de rol también
  // se omite — mismo criterio que el authMiddleware a nivel de mount en app.ts.
  const operators = isAuthRequired ? [requireRole('ADMIN', 'KITCHEN_STAFF')] : [];

  const controller = buildKitchenController(
    remanenteQueryRepository,
    remanenteRepository,
    recipeRepository,
    reconciliationRepository,
    recipePreparationRepository,
    { stockUnitOfWork, locationRepository },
    consumptionReasonRepository,
    settingsRepository
  );

  // Lectura de la lista FEFO: abierta a cualquier usuario autenticado (dato operativo,
  // no sensible) — la escritura sí exige rol explícito abajo.
  router.get('/remanentes-activos', controller.getActiveRemanentes);
  if (recipePreparationRepository) {
    // US-027: tablero de preparaciones de receta — lectura para cualquier autenticado.
    router.get('/recipe-preparations', controller.listRecipePreparations);
    router.get('/recipe-preparations/:id', controller.getRecipePreparation);
  }
  if (recipePreparationRepository && stockUnitOfWork && locationRepository) {
    // US-028: cierre / abandono de preparación — mutación, rol explícito.
    router.post('/recipe-preparations/:id/close', ...operators, controller.closePreparation);
    router.post('/recipe-preparations/:id/abandon', ...operators, controller.abandonPreparation);
  }
  if (remanenteRepository) {
    router.post('/remanentes/:id/consume', ...operators, controller.consumeRemanente);
    router.post('/remanentes/:id/discard', ...operators, controller.discardRemanente);
    router.post('/shift-reconciliation', ...operators, controller.performShiftReconciliation);
  }
  if (recipeRepository && stockUnitOfWork) {
    router.post('/recipes/:id/consume', ...operators, controller.consumeRecipe);
  }

  return router;
}
