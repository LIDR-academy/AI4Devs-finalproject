import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[ip] || now > store[ip].resetTime) {
      store[ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      next();
      return;
    }

    store[ip].count += 1;

    if (store[ip].count > max) {
      res.status(429).json({
        type: 'https://restostock.com/errors/too-many-requests',
        title: 'TooManyRequestsException',
        status: 429,
        detail: `Demasiados intentos de autenticacion. Por favor intente nuevamente en ${Math.ceil((store[ip].resetTime - now) / 1000)} segundos.`,
        instance: req.originalUrl || req.url,
      });
      return;
    }

    next();
  };
}
