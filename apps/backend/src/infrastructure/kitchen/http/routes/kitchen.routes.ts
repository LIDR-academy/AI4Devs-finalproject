import { Router, RequestHandler } from 'express';
import { KitchenController } from '../controllers/kitchen.controller.js';
import { GetActiveRemanentesUseCase } from '../../../../application/kitchen/use-cases/GetActiveRemanentesUseCase.js';
import { ConsumeRemanenteUseCase } from '../../../../application/kitchen/use-cases/ConsumeRemanenteUseCase.js';
import { DiscardRemanenteUseCase } from '../../../../application/kitchen/use-cases/DiscardRemanenteUseCase.js';
import { ConsumeRecipeUseCase } from '../../../../application/kitchen/use-cases/ConsumeRecipeUseCase.js';
import { GetRecipeAvailabilityUseCase } from '../../../../application/kitchen/use-cases/GetRecipeAvailabilityUseCase.js';
import { GetRecipePreparationsUseCase } from '../../../../application/kitchen/use-cases/GetRecipePreparationsUseCase.js';
import { ClosePreparationUseCase } from '../../../../application/kitchen/use-cases/ClosePreparationUseCase.js';
import { AbandonPreparationUseCase } from '../../../../application/kitchen/use-cases/AbandonPreparationUseCase.js';
import { IRemanenteQueryRepository } from '../../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IRemanenteRepository } from '../../../../domain/stock/repositories/IRemanenteRepository.js';
import { IInsumoRepository } from '../../../../domain/stock/repositories/IInsumoRepository.js';
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
import { IRoleRepository } from '../../../../domain/security/repositories/IRoleRepository.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';
import { authorizePermissions } from '../../../security/http/middleware/authorizePermissions.middleware.js';

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

// US-007 v1.1.0 / TK-111: `remanenteRepository` en producción es siempre `stockRepo`
// (implementa también `IInsumoRepository`) — `.findById` es el guard runtime de esa
// capacidad, ya que `IRemanenteRepository` no declara un método con ese nombre.
function buildRecipeAvailabilityUseCase(
  recipeRepository: IRecipeRepository | undefined,
  remanenteRepository: (IRemanenteRepository & Partial<IInsumoRepository>) | undefined,
  remanenteQueryRepository: IRemanenteQueryRepository
): GetRecipeAvailabilityUseCase | undefined {
  if (!recipeRepository || !remanenteRepository?.findById) {
    return undefined;
  }
  return new GetRecipeAvailabilityUseCase(recipeRepository, remanenteRepository as IInsumoRepository, remanenteQueryRepository);
}

function buildKitchenController(
  remanenteQueryRepository: IRemanenteQueryRepository,
  remanenteRepository?: IRemanenteRepository & Partial<IInsumoRepository>,
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
    preparationClose.abandon,
    buildRecipeAvailabilityUseCase(recipeRepository, remanenteRepository, remanenteQueryRepository)
  );
}

interface KitchenRouteDeps {
  remanenteRepository?: IRemanenteRepository & Partial<IInsumoRepository>;
  recipeRepository?: IRecipeRepository;
  recipePreparationRepository?: IRecipePreparationRepository;
  stockUnitOfWork?: IStockUnitOfWork;
  locationRepository?: IStorageLocationRepository;
}

// Lecturas: todas abiertas a cualquier autenticado (datos operativos, no sensibles) —
// solo previsualizan/consultan, no mutan nada.
function mountReadRoutes(router: Router, controller: KitchenController, deps: KitchenRouteDeps): void {
  router.get('/remanentes-activos', controller.getActiveRemanentes);
  if (deps.recipePreparationRepository) {
    // US-027: tablero de preparaciones de receta.
    router.get('/recipe-preparations', controller.listRecipePreparations);
    router.get('/recipe-preparations/:id', controller.getRecipePreparation);
  }
  if (deps.recipeRepository && deps.remanenteRepository?.findById) {
    // US-007 v1.1.0 / TK-111: requerido vs. disponible por ingrediente, antes de confirmar.
    router.get('/recipes/:id/availability', controller.getRecipeAvailability);
  }
}

interface MutationGuards {
  recipePrepare: RequestHandler[];
  remanenteConsume: RequestHandler[];
}

// TK-093 (AUDIT-SEC-001 F-3) / TK-117 (US-015 Escenario 3): cada ruta de mutación
// declara explícitamente su permiso — no basta el authMiddleware heredado a nivel de
// mount (default-deny). ADMIN y KITCHEN_STAFF tienen ambos permisos hoy (sin cambio de
// acceso real); la separación importa para cuando un rol personalizado tenga solo uno.
function mountMutationRoutes(router: Router, controller: KitchenController, guards: MutationGuards, deps: KitchenRouteDeps): void {
  if (deps.recipePreparationRepository && deps.stockUnitOfWork && deps.locationRepository) {
    // US-028: cierre / abandono de preparación — parte del flujo de preparar receta.
    router.post('/recipe-preparations/:id/close', ...guards.recipePrepare, controller.closePreparation);
    router.post('/recipe-preparations/:id/abandon', ...guards.recipePrepare, controller.abandonPreparation);
  }
  if (deps.remanenteRepository) {
    router.post('/remanentes/:id/consume', ...guards.remanenteConsume, controller.consumeRemanente);
    router.post('/remanentes/:id/discard', ...guards.remanenteConsume, controller.discardRemanente);
    // Conciliación de turno: ajusta cantidades de remanentes, mismo permiso que consumir/descartar.
    router.post('/shift-reconciliation', ...guards.remanenteConsume, controller.performShiftReconciliation);
  }
  if (deps.recipeRepository && deps.stockUnitOfWork) {
    router.post('/recipes/:id/consume', ...guards.recipePrepare, controller.consumeRecipe);
  }
}

export function createKitchenRouter(
  remanenteQueryRepository: IRemanenteQueryRepository,
  remanenteRepository?: IRemanenteRepository & Partial<IInsumoRepository>,
  recipeRepository?: IRecipeRepository,
  reconciliationRepository?: IShiftReconciliationRepository,
  isAuthRequired = true,
  recipePreparationRepository?: IRecipePreparationRepository,
  stockUnitOfWork?: IStockUnitOfWork,
  locationRepository?: IStorageLocationRepository,
  consumptionReasonRepository?: IConsumptionReasonRepository,
  settingsRepository?: ISystemSettingsRepository,
  roleRepository?: IRoleRepository
): Router {
  const router = Router();

  // TK-117 (US-015 Escenario 3): permiso fino por acción — antes un único
  // `requireRole('ADMIN', 'KITCHEN_STAFF')` para toda mutación. Cuando la auth está
  // desactivada (tests de negocio, requireAuth:false) el guard se omite — mismo
  // criterio que el authMiddleware a nivel de mount en app.ts. Sin `roleRepository`
  // inyectado, cae al guard grueso anterior — nunca a "sin guard".
  const fallback = (): RequestHandler[] => (isAuthRequired ? [requireRole('ADMIN', 'KITCHEN_STAFF')] : []);
  const guards: MutationGuards = !isAuthRequired
    ? { recipePrepare: [], remanenteConsume: [] }
    : roleRepository
      ? {
          recipePrepare: [authorizePermissions(roleRepository, 'kitchen:recipe_prepare')],
          remanenteConsume: [authorizePermissions(roleRepository, 'kitchen:remanente_consume')],
        }
      : { recipePrepare: fallback(), remanenteConsume: fallback() };

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

  const deps: KitchenRouteDeps = { remanenteRepository, recipeRepository, recipePreparationRepository, stockUnitOfWork, locationRepository };
  mountReadRoutes(router, controller, deps);
  mountMutationRoutes(router, controller, guards, deps);

  return router;
}
