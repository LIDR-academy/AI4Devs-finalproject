import { Router } from 'express';
import { KitchenController } from '../controllers/kitchen.controller.js';
import { GetActiveRemanentesUseCase } from '../../../../application/kitchen/use-cases/GetActiveRemanentesUseCase.js';
import { ConsumeRemanenteUseCase } from '../../../../application/kitchen/use-cases/ConsumeRemanenteUseCase.js';
import { DiscardRemanenteUseCase } from '../../../../application/kitchen/use-cases/DiscardRemanenteUseCase.js';
import { ConsumeRecipeUseCase } from '../../../../application/kitchen/use-cases/ConsumeRecipeUseCase.js';
import { IRemanenteQueryRepository } from '../../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IStockRepository } from '../../../../domain/stock/repositories/IStockRepository.js';
import { IRecipeRepository } from '../../../../domain/catalog/repositories/IRecipeRepository.js';

import { PerformShiftReconciliationUseCase } from '../../../../application/kitchen/use-cases/PerformShiftReconciliationUseCase.js';
import { InMemoryShiftReconciliationRepository } from '../../repositories/InMemoryShiftReconciliationRepository.js';

import { IShiftReconciliationRepository } from '../../../../domain/kitchen/repositories/IShiftReconciliationRepository.js';

export function createKitchenRouter(
  remanenteQueryRepository: IRemanenteQueryRepository,
  stockRepository?: IStockRepository,
  recipeRepository?: IRecipeRepository,
  reconciliationRepository?: IShiftReconciliationRepository
): Router {
  const router = Router();
  const getActiveUseCase = new GetActiveRemanentesUseCase(remanenteQueryRepository);
  const consumeUseCase = stockRepository ? new ConsumeRemanenteUseCase(stockRepository) : undefined;
  const discardUseCase = stockRepository ? new DiscardRemanenteUseCase(stockRepository) : undefined;
  const consumeRecipeUseCase =
    stockRepository && recipeRepository
      ? new ConsumeRecipeUseCase(recipeRepository, stockRepository)
      : undefined;

  const reconciliationRepo = reconciliationRepository ?? new InMemoryShiftReconciliationRepository();
  const performShiftReconciliationUseCase = stockRepository
    ? new PerformShiftReconciliationUseCase(stockRepository, remanenteQueryRepository, reconciliationRepo)
    : undefined;

  const controller = new KitchenController(
    getActiveUseCase,
    consumeUseCase,
    discardUseCase,
    consumeRecipeUseCase,
    performShiftReconciliationUseCase
  );

  router.get('/remanentes-activos', controller.getActiveRemanentes);
  if (stockRepository) {
    router.post('/remanentes/:id/consume', controller.consumeRemanente);
    router.post('/remanentes/:id/discard', controller.discardRemanente);
    router.post('/shift-reconciliation', controller.performShiftReconciliation);
  }
  if (stockRepository && recipeRepository) {
    router.post('/recipes/:id/consume', controller.consumeRecipe);
  }

  return router;
}
