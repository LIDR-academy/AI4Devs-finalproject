import { Router, Request, Response, NextFunction } from 'express';
import { IAiConfigurationRepository } from '../../../../domain/settings/repositories/IAiConfigurationRepository.js';
import { AiProviderType } from '../../../../domain/settings/value-objects/AiProvider.js';
import { CredentialEncryptionService } from '../../../security/CredentialEncryptionService.js';
import { GetAiConfigUseCase } from '../../../../application/settings/use-cases/GetAiConfigUseCase.js';
import { UpdateAiConfigUseCase } from '../../../../application/settings/use-cases/UpdateAiConfigUseCase.js';
import { TestAiConnectionUseCase } from '../../../../application/settings/use-cases/TestAiConnectionUseCase.js';
import { updateAiConfigSchema } from '../validation/aiSettings.schemas.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';
import { AuthenticatedRequest } from '../../../http/middlewares/authenticateJWT.js';
import { handleZodOrNext } from '../../../http/utils/responseUtils.js';

export function createAiSettingsController(
  repository: IAiConfigurationRepository,
  encryptionService: CredentialEncryptionService,
  isAuthRequired = true
): Router {
  const router = Router();
  const getUseCase = new GetAiConfigUseCase(repository);
  const updateUseCase = new UpdateAiConfigUseCase(repository, encryptionService);
  const testUseCase = new TestAiConnectionUseCase(repository, encryptionService);

  const adminOnly = isAuthRequired ? [requireRole('ADMIN')] : [];

  router.get('/', ...adminOnly, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await getUseCase.execute();
      res.status(200).json(config);
    } catch (err) {
      next(err);
    }
  });

  router.put('/', ...adminOnly, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = updateAiConfigSchema.parse(req.body);
      const updated = await updateUseCase.execute({
        ...parsed,
        provider: parsed.provider as AiProviderType,
        endpointUrl: parsed.endpointUrl === '' ? null : parsed.endpointUrl,
        updatedBy: req.user?.sub ?? null,
      });
      res.status(200).json(updated);
    } catch (err) {
      handleZodOrNext(req, res, next, err);
    }
  });

  router.post('/test', ...adminOnly, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await testUseCase.execute();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
