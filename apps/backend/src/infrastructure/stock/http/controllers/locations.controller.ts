import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IStorageLocationRepository } from '../../../../domain/stock/repositories/IStorageLocationRepository.js';
import { GetLocationsUseCase } from '../../../../application/stock/use-cases/GetLocationsUseCase.js';
import { CreateLocationUseCase } from '../../../../application/stock/use-cases/CreateLocationUseCase.js';
import { StorageLocation } from '../../../../domain/stock/entities/StorageLocation.js';
import { EntityNotFoundException } from '../../../../domain/errors/EntityNotFoundException.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';
import { respondValidationError } from '../../../http/utils/responseUtils.js';

const createLocationSchema = z.object({
  name: z.string().min(2, 'El nombre del sector debe tener al menos 2 caracteres.'),
  type: z.enum(['WAREHOUSE', 'KITCHEN'], {
    errorMap: () => ({ message: 'El tipo de sector debe ser WAREHOUSE o KITCHEN.' }),
  }),
  description: z.string().optional(),
});

const updateLocationSchema = z.object({
  name: z.string().min(2, 'El nombre del sector debe tener al menos 2 caracteres.').optional(),
  type: z.enum(['WAREHOUSE', 'KITCHEN']).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

function mapLocation(l: StorageLocation) {
  return { id: l.id, name: l.name, type: l.type, description: l.description, isActive: l.isActive };
}

function handleControllerError(req: Request, res: Response, next: NextFunction, err: unknown): void {
  if (err instanceof z.ZodError) {
    respondValidationError(req, res, err.errors.map((e) => e.message).join('; '));
    return;
  }
  next(err as Error);
}

function buildHandlers(locationRepo: IStorageLocationRepository) {
  const getLocationsUseCase = new GetLocationsUseCase(locationRepo);
  const createLocationUseCase = new CreateLocationUseCase(locationRepo);

  const list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const locations = await getLocationsUseCase.execute();
      res.json(locations.map(mapLocation));
    } catch (err) {
      next(err);
    }
  };

  const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createLocationSchema.parse(req.body);
      const loc = await createLocationUseCase.execute(parsed);
      res.status(201).json(mapLocation(loc));
    } catch (err) {
      handleControllerError(req, res, next, err);
    }
  };

  const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const parsed = updateLocationSchema.parse(req.body);
      const existing = await locationRepo.findLocationById(id);
      if (!existing) {
        throw new EntityNotFoundException('Sector de almacenamiento', id);
      }
      const updated = new StorageLocation({
        id: existing.id,
        name: parsed.name ?? existing.name,
        type: parsed.type ?? existing.type,
        description: parsed.description ?? existing.description,
        isActive: parsed.isActive ?? existing.isActive,
      });
      await locationRepo.saveLocation(updated);
      res.json(mapLocation(updated));
    } catch (err) {
      handleControllerError(req, res, next, err);
    }
  };

  const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await locationRepo.deleteLocation(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  return { list, create, update, remove };
}

/**
 * TK-074 (US-016): CRUD de sectores físicos de almacenamiento.
 * Guard 15 / patrón TK-093: `POST`, `PUT` y `DELETE` exigen rol `ADMIN` por ruta;
 * `GET` queda accesible a cualquier autenticado. Cuando la auth está desactivada
 * (`isAuthRequired === false`, tests de negocio) el guard de rol se omite — mismo
 * criterio que `stock.routes.ts`.
 */
export function createLocationsController(
  locationRepo: IStorageLocationRepository,
  isAuthRequired = true
): Router {
  const router = Router();
  const adminOnly = isAuthRequired ? [requireRole('ADMIN')] : [];
  const { list, create, update, remove } = buildHandlers(locationRepo);

  router.get('/', list);
  router.post('/', ...adminOnly, create);
  router.put('/:id', ...adminOnly, update);
  router.delete('/:id', ...adminOnly, remove);

  return router;
}
