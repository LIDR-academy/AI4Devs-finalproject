import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IStorageLocationRepository } from '../../../../domain/stock/repositories/IStorageLocationRepository.js';
import { GetLocationsUseCase } from '../../../../application/stock/use-cases/GetLocationsUseCase.js';
import { CreateLocationUseCase } from '../../../../application/stock/use-cases/CreateLocationUseCase.js';

const createLocationSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['WAREHOUSE', 'KITCHEN']),
  description: z.string().optional(),
});

export function createLocationsController(locationRepo: IStorageLocationRepository): Router {
  const router = Router();
  const getLocationsUseCase = new GetLocationsUseCase(locationRepo);
  const createLocationUseCase = new CreateLocationUseCase(locationRepo);

  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const locations = await getLocationsUseCase.execute();
      res.json(
        locations.map((l) => ({
          id: l.id,
          name: l.name,
          type: l.type,
          description: l.description,
          isActive: l.isActive,
        }))
      );
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createLocationSchema.parse(req.body);
      const loc = await createLocationUseCase.execute(parsed);
      res.status(201).json({
        id: loc.id,
        name: loc.name,
        type: loc.type,
        description: loc.description,
        isActive: loc.isActive,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
