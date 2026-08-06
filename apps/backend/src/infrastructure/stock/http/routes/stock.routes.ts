import { Router } from 'express';
import { StockController } from '../controllers/stock.controller.js';
import { RecordExtractionUseCase } from '../../../../application/stock/use-cases/RecordExtractionUseCase.js';
import { IStockRepository } from '../../../../domain/stock/repositories/IStockRepository.js';

export function createStockRouter(stockRepository: IStockRepository): Router {
  const router = Router();
  const useCase = new RecordExtractionUseCase(stockRepository);
  const controller = new StockController(useCase);

  router.post('/extraction', controller.recordExtraction);

  return router;
}
