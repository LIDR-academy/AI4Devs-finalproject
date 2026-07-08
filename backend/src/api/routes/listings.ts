import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { rateLimiterMiddleware } from '../middleware/rateLimiter';
import { AnalyzeListingUseCase } from '../../domain/services/AnalyzeListingUseCase';
import { AutoAttachService } from '../../domain/services/AutoAttachService';
import { LocationResolver } from '../../domain/services/LocationResolver';
import { CheerioAdapter } from '../../adapters/cheerio/CheerioAdapter';
import { OpenRouterAdapter } from '../../adapters/openrouter/OpenRouterAdapter';
import { CatastroAdapter } from '../../adapters/catastro/CatastroAdapter';
import { AnalyzedListingRepository } from '../../infrastructure/repositories/AnalyzedListingRepository';
import { prisma } from '../../infrastructure/prisma/client';
import { validateListingUrl, UrlValidationError } from '../../infrastructure/utils/urlValidator';
import { InvalidUrlError } from '../../domain/errors/DomainError';

export const listingsRouter = Router();

const analyzeSchema = z.object({
  url: z.string().url(),
  manualText: z.string().optional(),
});

const cheerio = new CheerioAdapter();
const openrouter = new OpenRouterAdapter();
const catastro = new CatastroAdapter();
const locationResolver = new LocationResolver();
const autoAttach = new AutoAttachService();
const repository = new AnalyzedListingRepository(prisma);
const analyzeUseCase = new AnalyzeListingUseCase(
  cheerio,
  openrouter,
  locationResolver,
  catastro,
  autoAttach,
  repository,
);

listingsRouter.post('/analyze', rateLimiterMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = analyzeSchema.parse(req.body);
    const url = validateListingUrl(body.url);
    const result = await analyzeUseCase.execute({
      url,
      sessionId: req.sessionId!,
      userId: req.userId!,
      manualText: body.manualText,
    });
    res.json(result);
  } catch (err) {
    if (err instanceof UrlValidationError) {
      next(new InvalidUrlError(err.message));
      return;
    }
    next(err);
  }
});

listingsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const listing = await analyzeUseCase.getById(id, req.userId!);
    if (!listing) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    res.json(listing);
  } catch (err) {
    next(err);
  }
});
