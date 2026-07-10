import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { rateLimiterMiddleware } from '../middleware/rateLimiter';
import { AnalyzeListingUseCase } from '../../domain/services/AnalyzeListingUseCase';
import { AutoAttachService } from '../../domain/services/AutoAttachService';
import { LocationResolver } from '../../domain/services/LocationResolver';
import { CheerioAdapter } from '../../adapters/cheerio/CheerioAdapter';
import { PlaywrightAdapter } from '../../adapters/playwright/PlaywrightAdapter';
import { BrowserPool } from '../../adapters/playwright/BrowserPool';
import { realChromiumLauncher } from '../../adapters/playwright/realChromiumLauncher';
import { ChainedFetchAdapter } from '../../adapters/fetch/ChainedFetchAdapter';
import { OpenRouterAdapter } from '../../adapters/openrouter/OpenRouterAdapter';
import { CatastroAdapter } from '../../adapters/catastro/CatastroAdapter';
import { AnalyzedListingRepository } from '../../infrastructure/repositories/AnalyzedListingRepository';
import { ChecklistRepository } from '../../infrastructure/repositories/ChecklistRepository';
import { prisma } from '../../infrastructure/prisma/client';
import { validateListingUrl, UrlValidationError } from '../../infrastructure/utils/urlValidator';
import { InvalidUrlError } from '../../domain/errors/DomainError';
import { env } from '../../infrastructure/config/env';

export const listingsRouter = Router();

const analyzeSchema = z.object({
  url: z.string().url().optional(),
  manualText: z.string().min(1).optional(),
});

// Composition root: Cheerio (fast) → Playwright (DataDome bypass).
// Only the chain is exposed; the use case depends on the port, not on
// concrete adapters. Tests can inject a single ListingFetchPort.
const cheerio = new CheerioAdapter();
const playwright = env.PLAYWRIGHT_ENABLED
  ? new PlaywrightAdapter({
      pool: new BrowserPool({ launcher: realChromiumLauncher(env.PLAYWRIGHT_HEADLESS), poolSize: env.PLAYWRIGHT_POOL_SIZE }),
      userAgent: env.REALISTA_USER_AGENT,
      gotoTimeoutMs: env.PLAYWRIGHT_BROWSER_TIMEOUT_MS,
    })
  : null;
const fetcher = playwright
  ? new ChainedFetchAdapter([cheerio, playwright])
  : cheerio;
const openrouter = new OpenRouterAdapter();
const catastro = new CatastroAdapter();
const locationResolver = new LocationResolver();
const autoAttach = new AutoAttachService();
const repository = new AnalyzedListingRepository(prisma);
const checklistRepository = new ChecklistRepository(prisma);
const analyzeUseCase = new AnalyzeListingUseCase(
  fetcher,
  openrouter,
  locationResolver,
  catastro,
  autoAttach,
  repository,
  checklistRepository,
);

listingsRouter.post('/analyze', rateLimiterMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = analyzeSchema.parse(req.body);
    const hasManualText = !!body.manualText?.trim();
    const hasUrl = !!body.url?.trim();

    if (!hasManualText && !hasUrl) {
      next(new InvalidUrlError('Se requiere una URL o texto del anuncio'));
      return;
    }

    const url = hasUrl
      ? validateListingUrl(body.url!)
      : 'manual://text-only';

    if (req.query.stream === 'true') {
      const { analyzeStream } = await import('../lib/analyzeStream');
      await analyzeStream(req, res, analyzeUseCase, { url, manualText: body.manualText });
      return;
    }
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
