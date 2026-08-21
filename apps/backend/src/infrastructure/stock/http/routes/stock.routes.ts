import { Router } from 'express';
import { StockController } from '../controllers/stock.controller.js';
import { RecordExtractionUseCase } from '../../../../application/stock/use-cases/RecordExtractionUseCase.js';
import { GetStockMovementHistoryUseCase } from '../../../../application/stock/use-cases/GetStockMovementHistoryUseCase.js';
import { IStockRepository } from '../../../../domain/stock/repositories/IStockRepository.js';
import { IStockMovementQueryRepository } from '../../../../domain/stock/repositories/IStockMovementQueryRepository.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';

export function createStockRouter(
  stockRepository: IStockRepository,
  stockMovementQueryRepository?: IStockMovementQueryRepository
): Router {
  const router = Router();
  const useCase = new RecordExtractionUseCase(stockRepository);
  const getMovementHistoryUseCase = stockMovementQueryRepository
    ? new GetStockMovementHistoryUseCase(stockMovementQueryRepository)
    : undefined;
  const controller = new StockController(useCase, getMovementHistoryUseCase);

  router.post('/extraction', controller.recordExtraction);
  // Trazabilidad de movimientos (TK-050): dato administrativo — solo ADMIN.
  router.get('/movements', requireRole('ADMIN'), controller.getMovementHistory);

  return router;
}
