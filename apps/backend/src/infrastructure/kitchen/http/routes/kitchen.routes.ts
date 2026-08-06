import { Router } from 'express';
import { KitchenController } from '../controllers/kitchen.controller.js';
import { GetActiveRemanentesUseCase } from '../../../../application/kitchen/use-cases/GetActiveRemanentesUseCase.js';
import { ConsumeRemanenteUseCase } from '../../../../application/kitchen/use-cases/ConsumeRemanenteUseCase.js';
import { DiscardRemanenteUseCase } from '../../../../application/kitchen/use-cases/DiscardRemanenteUseCase.js';
import { IRemanenteQueryRepository } from '../../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IStockRepository } from '../../../../domain/stock/repositories/IStockRepository.js';

export function createKitchenRouter(
  remanenteQueryRepository: IRemanenteQueryRepository,
  stockRepository?: IStockRepository
): Router {
  const router = Router();
  const getActiveUseCase = new GetActiveRemanentesUseCase(remanenteQueryRepository);
  const consumeUseCase = stockRepository ? new ConsumeRemanenteUseCase(stockRepository) : undefined;
  const discardUseCase = stockRepository ? new DiscardRemanenteUseCase(stockRepository) : undefined;
  const controller = new KitchenController(getActiveUseCase, consumeUseCase, discardUseCase);

  router.get('/remanentes-activos', controller.getActiveRemanentes);
  if (stockRepository) {
    router.post('/remanentes/:id/consume', controller.consumeRemanente);
    router.post('/remanentes/:id/discard', controller.discardRemanente);
  }

  return router;
}
