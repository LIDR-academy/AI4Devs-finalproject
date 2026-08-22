import { Router } from 'express';
import { KitchenController } from '../controllers/kitchen.controller.js';
import { GetActiveRemanentesUseCase } from '../../../../application/kitchen/use-cases/GetActiveRemanentesUseCase.js';
import { ConsumeRemanenteUseCase } from '../../../../application/kitchen/use-cases/ConsumeRemanenteUseCase.js';
import { DiscardRemanenteUseCase } from '../../../../application/kitchen/use-cases/DiscardRemanenteUseCase.js';
import { ConsumeRecipeUseCase } from '../../../../application/kitchen/use-cases/ConsumeRecipeUseCase.js';
import { IRemanenteQueryRepository } from '../../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IRemanenteRepository } from '../../../../domain/stock/repositories/IRemanenteRepository.js';
import { IRecipeRepository } from '../../../../domain/catalog/repositories/IRecipeRepository.js';

import { PerformShiftReconciliationUseCase } from '../../../../application/kitchen/use-cases/PerformShiftReconciliationUseCase.js';
import { InMemoryShiftReconciliationRepository } from '../../repositories/InMemoryShiftReconciliationRepository.js';

import { IShiftReconciliationRepository } from '../../../../domain/kitchen/repositories/IShiftReconciliationRepository.js';

export function createKitchenRouter(
  remanenteQueryRepository: IRemanenteQueryRepository,
  remanenteRepository?: IRemanenteRepository,
  recipeRepository?: IRecipeRepository,
  reconciliationRepository?: IShiftReconciliationRepository
): Router {
  const router = Router();
  const getActiveUseCase = new GetActiveRemanentesUseCase(remanenteQueryRepository);
  const consumeUseCase = remanenteRepository ? new ConsumeRemanenteUseCase(remanenteRepository) : undefined;
  const discardUseCase = remanenteRepository ? new DiscardRemanenteUseCase(remanenteRepository) : undefined;
  const consumeRecipeUseCase =
    remanenteRepository && recipeRepository
      ? new ConsumeRecipeUseCase(recipeRepository, remanenteRepository)
      : undefined;

  const reconciliationRepo = reconciliationRepository ?? new InMemoryShiftReconciliationRepository();
  const performShiftReconciliationUseCase = remanenteRepository
    ? new PerformShiftReconciliationUseCase(remanenteRepository, remanenteQueryRepository, reconciliationRepo)
    : undefined;

  const controller = new KitchenController(
    getActiveUseCase,
    consumeUseCase,
    discardUseCase,
    consumeRecipeUseCase,
    performShiftReconciliationUseCase
  );

  router.get('/remanentes-activos', controller.getActiveRemanentes);
  if (remanenteRepository) {
    router.post('/remanentes/:id/consume', controller.consumeRemanente);
    router.post('/remanentes/:id/discard', controller.discardRemanente);
    router.post('/shift-reconciliation', controller.performShiftReconciliation);
  }
  if (remanenteRepository && recipeRepository) {
    router.post('/recipes/:id/consume', controller.consumeRecipe);
  }

  return router;
}
