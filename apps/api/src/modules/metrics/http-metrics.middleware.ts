import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MetricsService } from './metrics.service';
import { isMetricsScrapePath, normalizeHttpRoute } from './route-normalizer';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime.bigint();
    const requestPath = req.originalUrl ?? req.url ?? '';

    if (isMetricsScrapePath(requestPath)) {
      next();
      return;
    }

    res.on('finish', () => {
      const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
      const route = normalizeHttpRoute({
        routePath: req.route?.path,
        baseUrl: req.baseUrl,
        url: requestPath,
      });

      this.metricsService.observeHttpRequest({
        method: req.method,
        route,
        statusCode: res.statusCode,
        durationSeconds,
      });
    });

    next();
  }
}
