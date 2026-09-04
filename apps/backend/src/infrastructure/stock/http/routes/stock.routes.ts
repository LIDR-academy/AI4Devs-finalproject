import { Router } from 'express';
import { StockController } from '../controllers/stock.controller.js';
import { RecordExtractionUseCase } from '../../../../application/stock/use-cases/RecordExtractionUseCase.js';
import { GetStockMovementHistoryUseCase } from '../../../../application/stock/use-cases/GetStockMovementHistoryUseCase.js';
import { CreateInsumoUseCase } from '../../../../application/stock/use-cases/CreateInsumoUseCase.js';
import { ListInsumosUseCase } from '../../../../application/stock/use-cases/ListInsumosUseCase.js';
import { RestockInsumoUseCase } from '../../../../application/stock/use-cases/RestockInsumoUseCase.js';
import { IInsumoRepository } from '../../../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteRepository } from '../../../../domain/stock/repositories/IRemanenteRepository.js';
import { IStockUnitOfWork } from '../../../../domain/stock/repositories/IStockUnitOfWork.js';
import { systemClock } from '../../../shared/systemClock.js';
import { cryptoIdGenerator } from '../../../shared/cryptoIdGenerator.js';
import { IStockMovementQueryRepository } from '../../../../domain/stock/repositories/IStockMovementQueryRepository.js';
import { IStorageLocationRepository } from '../../../../domain/stock/repositories/IStorageLocationRepository.js';
import { IRecipePreparationRepository } from '../../../../domain/kitchen/repositories/IRecipePreparationRepository.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';

export function createStockRouter(
  stockRepository: IInsumoRepository & IRemanenteRepository & IStockUnitOfWork,
  stockMovementQueryRepository?: IStockMovementQueryRepository,
  isAuthRequired = true,
  locationRepository?: IStorageLocationRepository,
  recipePreparationRepository?: IRecipePreparationRepository
): Router {
  const router = Router();

  // TK-093 (AUDIT-SEC-001 F-3): rol explícito por ruta. Cuando la auth está desactivada
  // (tests de negocio, requireAuth:false) el guard de rol se omite — mismo criterio que
  // el authMiddleware a nivel de mount en app.ts.
  const role = (...roles: string[]): ReturnType<typeof requireRole>[] =>
    isAuthRequired ? [requireRole(...roles)] : [];
  // args: (insumoRepository, unitOfWork, clock, idGenerator, locationRepository)
  // — el repo concreto satisface las 2 primeras interfaces.
  const useCase = new RecordExtractionUseCase(
    stockRepository,
    stockRepository,
    systemClock,
    cryptoIdGenerator,
    locationRepository,
    recipePreparationRepository
  );
  const getMovementHistoryUseCase = stockMovementQueryRepository
    ? new GetStockMovementHistoryUseCase(stockMovementQueryRepository)
    : undefined;
  const createInsumoUseCase = new CreateInsumoUseCase(stockRepository, locationRepository);
  const listInsumosUseCase = new ListInsumosUseCase(stockRepository, locationRepository);
  const restockInsumoUseCase = new RestockInsumoUseCase(stockRepository, stockRepository, cryptoIdGenerator, locationRepository);
  const controller = new StockController(
    useCase,
    getMovementHistoryUseCase,
    createInsumoUseCase,
    listInsumosUseCase,
    restockInsumoUseCase
  );

  // Extracción de bodega (US-014/TK-072): la ejecutan operarios de cocina y admins.
  router.post('/extraction', ...role('ADMIN', 'KITCHEN_STAFF'), controller.recordExtraction);
  // Trazabilidad de movimientos (TK-050): dato administrativo — solo ADMIN.
  router.get('/movements', ...role('ADMIN'), controller.getMovementHistory);
  // Catálogo de insumos (TK-057): alta administrativa, listado para cualquier autenticado.
  router.post('/insumos', ...role('ADMIN'), controller.createInsumo);
  router.get('/insumos', controller.listInsumos);
  // Reabastecimiento de bodega (US-013/TK-060): incrementa warehouseStock, solo ADMIN.
  router.patch('/insumos/:id/restock', ...role('ADMIN'), controller.restockInsumo);

  return router;
}
