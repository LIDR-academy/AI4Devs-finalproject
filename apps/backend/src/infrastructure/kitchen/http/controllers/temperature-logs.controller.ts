import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ITemperatureLogRepository } from '../../../../domain/kitchen/repositories/ITemperatureLogRepository.js';
import { IStorageLocationRepository } from '../../../../domain/stock/repositories/IStorageLocationRepository.js';
import { RecordTemperatureLogUseCase } from '../../../../application/kitchen/use-cases/RecordTemperatureLogUseCase.js';
import { ListTemperatureLogsUseCase } from '../../../../application/kitchen/use-cases/ListTemperatureLogsUseCase.js';
import { IdGenerator } from '../../../../domain/shared/IdGenerator.js';
import { Clock } from '../../../../domain/shared/Clock.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';
import { AuthenticatedRequest } from '../../../http/middlewares/authenticateJWT.js';
import { handleZodOrNext, parseDateRangeQuery } from '../../../http/utils/responseUtils.js';

const createSchema = z.object({
  storageLocationId: z.string().min(1, 'El sub-sector es obligatorio.'),
  unitType: z.enum(['REFRIGERATOR', 'FREEZER'], {
    errorMap: () => ({ message: 'unitType debe ser REFRIGERATOR o FREEZER.' }),
  }),
  // FASE 4.B (revisor adversarial, TK-120): la parte entera se acota a 3 dígitos para
  // coincidir exactamente con la columna `Decimal(5,2)` de schema.prisma (±999.99) —
  // mismo criterio que `unitCost` en stock.controller.ts frente a su `Decimal(12,2)`.
  // Sin el límite, un valor que desborda la columna llegaba a Postgres y volvía como
  // 500 genérico en vez de un 400 explícito.
  temperatureCelsius: z
    .string()
    .regex(/^-?\d{1,3}(\.\d{1,2})?$/, 'temperatureCelsius debe ser un número decimal válido de hasta 3 dígitos enteros y 2 decimales (ej. "-18.00" a "999.99").'),
});

const listQuerySchema = z.object({
  storageLocationId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * US-033/TK-120. Registrar (`POST`) cualquier rol autenticado; consultar histórico
 * (`GET`) solo `ADMIN` — mismo patrón asimétrico ya usado por el resto de endpoints de
 * auditoría/reportes. `recordedByUserId` sale SIEMPRE del token cuando hay autenticación
 * activa (AUDIT-DEV-006 F-8: mismo criterio que la autoría de extracción de bodega) —
 * solo se acepta del body cuando `isAuthRequired` es `false` (tests de negocio).
 */
export function createTemperatureLogsController(
  repository: ITemperatureLogRepository,
  locationRepository: IStorageLocationRepository,
  idGenerator: IdGenerator,
  clock: Clock,
  isAuthRequired = true
): Router {
  const router = Router();
  const recordUseCase = new RecordTemperatureLogUseCase(repository, locationRepository, idGenerator, clock);
  const listUseCase = new ListTemperatureLogsUseCase(repository);
  const adminOnly = isAuthRequired ? [requireRole('ADMIN')] : [];

  router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = createSchema.parse(req.body);
      const recordedByUserId = req.user?.sub ?? (req.body as { recordedByUserId?: string }).recordedByUserId;
      const result = await recordUseCase.execute({ ...parsed, recordedByUserId: recordedByUserId ?? '' });
      res.status(201).json(result);
    } catch (err) {
      handleZodOrNext(req, res, next, err);
    }
  });

  router.get('/', ...adminOnly, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = listQuerySchema.parse(req.query);
      const result = await listUseCase.execute({
        storageLocationId: query.storageLocationId,
        ...parseDateRangeQuery(query),
      });
      res.status(200).json(result);
    } catch (err) {
      handleZodOrNext(req, res, next, err);
    }
  });

  return router;
}
