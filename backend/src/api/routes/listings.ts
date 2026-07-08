import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { rateLimiterMiddleware } from '../middleware/rateLimiter';
import { AnalyzeListingUseCase } from '../../domain/services/AnalyzeListingUseCase';
import { AutoAttachService } from '../../domain/services/AutoAttachService';
import { CheerioAdapter } from '../../adapters/cheerio/CheerioAdapter';
import { OpenRouterAdapter } from '../../adapters/openrouter/OpenRouterAdapter';
import { DeclaredLocationAdapter } from '../../adapters/location/DeclaredLocationAdapter';
import { GeocodingAdapter } from '../../adapters/location/GeocodingAdapter';
import { CatastroAdapter } from '../../adapters/catastro/CatastroAdapter';
import { MiraTuZonaAdapter } from '../../adapters/miratuzona/MiraTuZonaAdapter';
import { validateListingUrl, UrlValidationError } from '../../infrastructure/utils/urlValidator';
import { InvalidUrlError } from '../../domain/errors/DomainError';

export const listingsRouter = Router();

const analyzeSchema = z.object({
  url: z.string().url(),
  manualText: z.string().optional(),
});

const cheerio = new CheerioAdapter();
const openrouter = new OpenRouterAdapter();
const declaredLocation = new DeclaredLocationAdapter();
const geocoding = new GeocodingAdapter();
const catastro = new CatastroAdapter();
const miratuzona = new MiraTuZonaAdapter();
const autoAttach = new AutoAttachService();
const analyzeUseCase = new AnalyzeListingUseCase(
  cheerio,
  openrouter,
  declaredLocation,
  geocoding,
  catastro,
  miratuzona,
  autoAttach,
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
