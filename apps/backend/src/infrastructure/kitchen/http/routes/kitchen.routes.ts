import { Router } from 'express';
import { KitchenController } from '../controllers/kitchen.controller.js';
import { GetActiveRemanentesUseCase } from '../../../../application/kitchen/use-cases/GetActiveRemanentesUseCase.js';
import { IRemanenteQueryRepository } from '../../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';

export function createKitchenRouter(remanenteQueryRepository: IRemanenteQueryRepository): Router {
  const router = Router();
  const useCase = new GetActiveRemanentesUseCase(remanenteQueryRepository);
  const controller = new KitchenController(useCase);

  router.get('/remanentes-activos', controller.getActiveRemanentes);

  return router;
}
