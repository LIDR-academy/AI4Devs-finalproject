import { Router } from 'express';
import { StockController } from '../controllers/stock.controller.js';
import { RecordExtractionUseCase } from '../../../../application/stock/use-cases/RecordExtractionUseCase.js';
import { GetStockMovementHistoryUseCase } from '../../../../application/stock/use-cases/GetStockMovementHistoryUseCase.js';
import { CreateInsumoUseCase } from '../../../../application/stock/use-cases/CreateInsumoUseCase.js';
import { ListInsumosUseCase } from '../../../../application/stock/use-cases/ListInsumosUseCase.js';
import { IInsumoRepository } from '../../../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteRepository } from '../../../../domain/stock/repositories/IRemanenteRepository.js';
import { IStockMovementQueryRepository } from '../../../../domain/stock/repositories/IStockMovementQueryRepository.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';

export function createStockRouter(
  stockRepository: IInsumoRepository & IRemanenteRepository,
  stockMovementQueryRepository?: IStockMovementQueryRepository
): Router {
  const router = Router();
  const useCase = new RecordExtractionUseCase(stockRepository, stockRepository);
  const getMovementHistoryUseCase = stockMovementQueryRepository
    ? new GetStockMovementHistoryUseCase(stockMovementQueryRepository)
    : undefined;
  const createInsumoUseCase = new CreateInsumoUseCase(stockRepository);
  const listInsumosUseCase = new ListInsumosUseCase(stockRepository);
  const controller = new StockController(
    useCase,
    getMovementHistoryUseCase,
    createInsumoUseCase,
    listInsumosUseCase
  );

  router.post('/extraction', controller.recordExtraction);
  // Trazabilidad de movimientos (TK-050): dato administrativo — solo ADMIN.
  router.get('/movements', requireRole('ADMIN'), controller.getMovementHistory);
  // Catálogo de insumos (TK-057): alta administrativa, listado para cualquier autenticado.
  router.post('/insumos', requireRole('ADMIN'), controller.createInsumo);
  router.get('/insumos', controller.listInsumos);

  return router;
}
