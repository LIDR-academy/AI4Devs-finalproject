import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ISystemSettingsRepository } from '../../../../domain/settings/repositories/ISystemSettingsRepository.js';
import { GetSystemSettingsUseCase } from '../../../../application/settings/use-cases/GetSystemSettingsUseCase.js';
import { UpdateSystemSettingsUseCase } from '../../../../application/settings/use-cases/UpdateSystemSettingsUseCase.js';

const updateSettingsSchema = z.object({
  restaurantName: z.string().min(2).optional(),
  taxId: z.string().optional(),
  currencySymbol: z.string().min(1).max(5).optional(),
  criticalAlertHours: z.number().int().positive().optional(),
  defaultRemanenteHours: z.number().int().positive().optional(),
  varianceTolerancePercent: z.number().min(0).max(100).optional(),
  idleTimeoutMinutes: z.number().int().min(1).max(1440).optional(),
});

export function createSettingsController(settingsRepo: ISystemSettingsRepository): Router {
  const router = Router();
  const getSettingsUseCase = new GetSystemSettingsUseCase(settingsRepo);
  const updateSettingsUseCase = new UpdateSystemSettingsUseCase(settingsRepo);

  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const s = await getSettingsUseCase.execute();
      res.json({
        id: s.id,
        restaurantName: s.restaurantName,
        taxId: s.taxId,
        currencySymbol: s.currencySymbol,
        criticalAlertHours: s.criticalAlertHours,
        defaultRemanenteHours: s.defaultRemanenteHours,
        varianceTolerancePercent: s.varianceTolerancePercent,
        idleTimeoutMinutes: s.idleTimeoutMinutes ?? 15,
      });
    } catch (err) {
      next(err);
    }
  });

  router.put('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateSettingsSchema.parse(req.body);
      const s = await updateSettingsUseCase.execute(parsed);
      res.json({
        id: s.id,
        restaurantName: s.restaurantName,
        taxId: s.taxId,
        currencySymbol: s.currencySymbol,
        criticalAlertHours: s.criticalAlertHours,
        defaultRemanenteHours: s.defaultRemanenteHours,
        varianceTolerancePercent: s.varianceTolerancePercent,
        idleTimeoutMinutes: s.idleTimeoutMinutes ?? 15,
      });
    } catch (err) {
      next(err);
    }
  });


  return router;
}
