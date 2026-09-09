import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IConsumptionReasonRepository } from '../../../../domain/kitchen/repositories/IConsumptionReasonRepository.js';
import { ConsumptionReason } from '../../../../domain/kitchen/entities/ConsumptionReason.js';
import { ListConsumptionReasonsUseCase } from '../../../../application/kitchen/use-cases/ListConsumptionReasonsUseCase.js';
import { CreateConsumptionReasonUseCase } from '../../../../application/kitchen/use-cases/CreateConsumptionReasonUseCase.js';
import { UpdateConsumptionReasonUseCase } from '../../../../application/kitchen/use-cases/UpdateConsumptionReasonUseCase.js';
import { IdGenerator } from '../../../../domain/shared/IdGenerator.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';
import { AuthenticatedRequest } from '../../../http/middlewares/authenticateJWT.js';
import { handleZodOrNext } from '../../../http/utils/responseUtils.js';

const createSchema = z.object({ label: z.string().min(1, 'La etiqueta del motivo es obligatoria.') });
const updateSchema = z.object({
  label: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

function mapReason(r: ConsumptionReason) {
  return { id: r.id, label: r.label, isActive: r.isActive };
}

// US-030 Escenario 4: `includeInactive=true` es un dato administrativo — mismo
// criterio de rol explícito por ruta que el resto de la app (TK-093).
function requireAdminForInactiveFilter(isAuthRequired: boolean) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!isAuthRequired || req.query.includeInactive !== 'true') {
      next();
      return;
    }
    requireRole('ADMIN')(req, res, next);
  };
}

export function createConsumptionReasonsController(
  repository: IConsumptionReasonRepository,
  idGenerator: IdGenerator,
  isAuthRequired = true
): Router {
  const router = Router();
  const listUseCase = new ListConsumptionReasonsUseCase(repository);
  const createUseCase = new CreateConsumptionReasonUseCase(repository, idGenerator);
  const updateUseCase = new UpdateConsumptionReasonUseCase(repository);
  const adminOnly = isAuthRequired ? [requireRole('ADMIN')] : [];

  router.get('/', requireAdminForInactiveFilter(isAuthRequired), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const reasons = await listUseCase.execute(includeInactive);
      res.status(200).json(reasons.map(mapReason));
    } catch (err) {
      next(err);
    }
  });

  router.post('/', ...adminOnly, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createSchema.parse(req.body);
      const reason = await createUseCase.execute(parsed);
      res.status(201).json(mapReason(reason));
    } catch (err) {
      handleZodOrNext(req, res, next, err);
    }
  });

  router.put('/:id', ...adminOnly, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateSchema.parse(req.body);
      const reason = await updateUseCase.execute({ id: req.params.id, ...parsed });
      res.status(200).json(mapReason(reason));
    } catch (err) {
      handleZodOrNext(req, res, next, err);
    }
  });

  return router;
}
