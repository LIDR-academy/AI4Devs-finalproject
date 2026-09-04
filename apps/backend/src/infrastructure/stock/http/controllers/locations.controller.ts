import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IStorageLocationRepository } from '../../../../domain/stock/repositories/IStorageLocationRepository.js';
import { IInsumoRepository } from '../../../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteRepository } from '../../../../domain/stock/repositories/IRemanenteRepository.js';
import { GetLocationsUseCase } from '../../../../application/stock/use-cases/GetLocationsUseCase.js';
import { CreateLocationUseCase } from '../../../../application/stock/use-cases/CreateLocationUseCase.js';
import { StorageLocation } from '../../../../domain/stock/entities/StorageLocation.js';
import { EntityNotFoundException } from '../../../../domain/errors/EntityNotFoundException.js';
import { LocationHasStockException } from '../../../../domain/stock/errors/LocationHasStockException.js';
import { LocationHasRemanentesException } from '../../../../domain/stock/errors/LocationHasRemanentesException.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';
import { handleZodOrNext } from '../../../http/utils/responseUtils.js';

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


type StockAndRemanenteRepo = IInsumoRepository & Partial<IRemanenteRepository>;

async function assertLocationHasNoStock(
  repo: StockAndRemanenteRepo | undefined,
  location: StorageLocation
): Promise<void> {
  if (!repo) return;
  if (location.type === 'WAREHOUSE' && (await repo.existsStockAtLocation(location.id))) {
    throw new LocationHasStockException(location.name);
  }
  // US-026 / Invariante 5: un área de cocina con remanentes activos es indeleble.
  if (
    location.type === 'KITCHEN' &&
    repo.existsActiveRemanenteAtLocation &&
    (await repo.existsActiveRemanenteAtLocation(location.id, location.name))
  ) {
    throw new LocationHasRemanentesException(location.name);
  }
}

async function applyLocationUpdate(
  locationRepo: IStorageLocationRepository,
  insumoRepo: StockAndRemanenteRepo | undefined,
  id: string,
  parsed: ReturnType<typeof updateLocationSchema.parse>
): Promise<StorageLocation> {
  const existing = await locationRepo.findLocationById(id);
  if (!existing) {
    throw new EntityNotFoundException('Sector de almacenamiento', id);
  }
  // US-025: no permitir desactivar un sector con existencias.
  if (parsed.isActive === false && existing.isActive) {
    await assertLocationHasNoStock(insumoRepo, existing);
  }
  const updated = new StorageLocation({
    id: existing.id,
    name: parsed.name ?? existing.name,
    type: parsed.type ?? existing.type,
    description: parsed.description ?? existing.description,
    isActive: parsed.isActive ?? existing.isActive,
  });
  await locationRepo.saveLocation(updated);
  return updated;
}

function buildHandlers(locationRepo: IStorageLocationRepository, insumoRepo?: StockAndRemanenteRepo) {
  const getLocationsUseCase = new GetLocationsUseCase(locationRepo, insumoRepo);
  const createLocationUseCase = new CreateLocationUseCase(locationRepo);

  const list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await getLocationsUseCase.execute());
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
      handleZodOrNext(req, res, next, err);
    }
  };

  const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateLocationSchema.parse(req.body);
      const updated = await applyLocationUpdate(locationRepo, insumoRepo, req.params.id, parsed);
      res.json(mapLocation(updated));
    } catch (err) {
      handleZodOrNext(req, res, next, err);
    }
  };

  const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await locationRepo.findLocationById(req.params.id);
      if (existing) {
        await assertLocationHasNoStock(insumoRepo, existing);
      }
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
  isAuthRequired = true,
  insumoRepo?: StockAndRemanenteRepo
): Router {
  const router = Router();
  const adminOnly = isAuthRequired ? [requireRole('ADMIN')] : [];
  const { list, create, update, remove } = buildHandlers(locationRepo, insumoRepo);

  router.get('/', list);
  router.post('/', ...adminOnly, create);
  router.put('/:id', ...adminOnly, update);
  router.delete('/:id', ...adminOnly, remove);

  return router;
}
