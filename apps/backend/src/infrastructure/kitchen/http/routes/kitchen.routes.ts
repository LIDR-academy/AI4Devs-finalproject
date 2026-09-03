import { Router } from 'express';
import { KitchenController } from '../controllers/kitchen.controller.js';
import { GetActiveRemanentesUseCase } from '../../../../application/kitchen/use-cases/GetActiveRemanentesUseCase.js';
import { ConsumeRemanenteUseCase } from '../../../../application/kitchen/use-cases/ConsumeRemanenteUseCase.js';
import { DiscardRemanenteUseCase } from '../../../../application/kitchen/use-cases/DiscardRemanenteUseCase.js';
import { ConsumeRecipeUseCase } from '../../../../application/kitchen/use-cases/ConsumeRecipeUseCase.js';
import { IRemanenteQueryRepository } from '../../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IRemanenteRepository } from '../../../../domain/stock/repositories/IRemanenteRepository.js';
import { IRecipeRepository } from '../../../../domain/recipes/repositories/IRecipeRepository.js';

import { PerformShiftReconciliationUseCase } from '../../../../application/kitchen/use-cases/PerformShiftReconciliationUseCase.js';
import { InMemoryShiftReconciliationRepository } from '../../repositories/InMemoryShiftReconciliationRepository.js';

import { IShiftReconciliationRepository } from '../../../../domain/kitchen/repositories/IShiftReconciliationRepository.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';

function buildKitchenController(
  remanenteQueryRepository: IRemanenteQueryRepository,
  remanenteRepository?: IRemanenteRepository,
  recipeRepository?: IRecipeRepository,
  reconciliationRepository?: IShiftReconciliationRepository
): KitchenController {
  const reconciliationRepo = reconciliationRepository ?? new InMemoryShiftReconciliationRepository();
  return new KitchenController(
    new GetActiveRemanentesUseCase(remanenteQueryRepository),
    remanenteRepository ? new ConsumeRemanenteUseCase(remanenteRepository) : undefined,
    remanenteRepository ? new DiscardRemanenteUseCase(remanenteRepository) : undefined,
    remanenteRepository && recipeRepository
      ? new ConsumeRecipeUseCase(recipeRepository, remanenteRepository)
      : undefined,
    remanenteRepository
      ? new PerformShiftReconciliationUseCase(remanenteRepository, remanenteQueryRepository, reconciliationRepo)
      : undefined
  );
}

export function createKitchenRouter(
  remanenteQueryRepository: IRemanenteQueryRepository,
  remanenteRepository?: IRemanenteRepository,
  recipeRepository?: IRecipeRepository,
  reconciliationRepository?: IShiftReconciliationRepository,
  isAuthRequired = true
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
    reconciliationRepository
  );

  // Lectura de la lista FEFO: abierta a cualquier usuario autenticado (dato operativo,
  // no sensible) — la escritura sí exige rol explícito abajo.
  router.get('/remanentes-activos', controller.getActiveRemanentes);
  if (remanenteRepository) {
    router.post('/remanentes/:id/consume', ...operators, controller.consumeRemanente);
    router.post('/remanentes/:id/discard', ...operators, controller.discardRemanente);
    router.post('/shift-reconciliation', ...operators, controller.performShiftReconciliation);
  }
  if (remanenteRepository && recipeRepository) {
    router.post('/recipes/:id/consume', ...operators, controller.consumeRecipe);
  }

  return router;
}
