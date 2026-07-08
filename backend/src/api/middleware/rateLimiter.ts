import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../infrastructure/config/env';
import { RATE_LIMITED_STATUS } from '../errors/DomainError';

/**
 * Rate limit middleware (T015). 20 analyses/day per session UUID (FR-010, FR-020).
 * Counts only POST /api/listings/analyze calls.
 */
export async function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.sessionId) {
      res.status(401).json({ error: 'SESSION_REQUIRED' });
      return;
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const counter = await prisma.rateLimitCounter.upsert({
      where: {
        sessionId_date: { sessionId: req.sessionId, date: today },
      },
      update: { count: { increment: 1 } },
      create: { sessionId: req.sessionId, date: today, count: 1 },
    });

    res.setHeader('X-RateLimit-Limit', env.RATE_LIMIT_PER_DAY);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, env.RATE_LIMIT_PER_DAY - counter.count));
    res.setHeader('X-RateLimit-Reset', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

    if (counter.count > env.RATE_LIMIT_PER_DAY) {
      res.status(RATE_LIMITED_STATUS).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Has alcanzado el límite de ${env.RATE_LIMIT_PER_DAY} análisis por día`,
        resetAt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      });
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
}
