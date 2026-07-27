import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { RATE_LIMITED_STATUS } from '../../../src/domain/errors/DomainError';

const { mockPrisma } = vi.hoisted(() => {
  const createDate = (): Date => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  };

  return {
    mockPrisma: {
      rateLimitCounter: {
        upsert: vi.fn(),
      },
    },
    createDate,
  };
});

vi.mock('../../../src/infrastructure/prisma/client', () => ({
  prisma: mockPrisma,
}));

vi.mock('../../../src/infrastructure/config/env', () => ({
  env: {
    RATE_LIMIT_PER_DAY: 20,
  },
}));

import { rateLimiterMiddleware } from '../../../src/api/middleware/rateLimiter';

function makeReq(sessionId: string | null = 'test-session') {
  return {
    sessionId: sessionId ?? undefined,
    header: vi.fn().mockReturnValue(undefined),
  } as unknown as Request;
}

function makeRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn();
  return res;
}

function makeNext(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}

describe('rateLimiterMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('permite la petición cuando está por debajo del límite', async () => {
    mockPrisma.rateLimitCounter.upsert.mockResolvedValue({ count: 5 });

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await rateLimiterMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 20);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 15);
  });

  it('permite la petición justo en el límite (count 20)', async () => {
    mockPrisma.rateLimitCounter.upsert.mockResolvedValue({ count: 20 });

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await rateLimiterMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 0);
  });

  it('bloquea la petición cuando se excede el límite (count > 20)', async () => {
    mockPrisma.rateLimitCounter.upsert.mockResolvedValue({ count: 21 });

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await rateLimiterMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(RATE_LIMITED_STATUS);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'RATE_LIMIT_EXCEEDED',
      }),
    );
  });

  it('rechaza petición sin sessionId', async () => {
    const req = makeReq(null);
    const res = makeRes();
    const next = makeNext();

    await rateLimiterMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'SESSION_REQUIRED' });
  });

  it('incluye headers de rate limit en la respuesta', async () => {
    mockPrisma.rateLimitCounter.upsert.mockResolvedValue({ count: 3 });

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await rateLimiterMiddleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 20);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 17);
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-RateLimit-Reset',
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}/),
    );
  });

  it('continúa al siguiente middleware cuando ocurre un error inesperado en prisma', async () => {
    const dbError = new Error('DB connection lost');
    mockPrisma.rateLimitCounter.upsert.mockRejectedValue(dbError);

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await rateLimiterMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});
