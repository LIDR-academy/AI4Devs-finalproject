import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max } = options;
  // Store por-instancia (no a nivel de modulo): cada createRateLimiter() debe llevar su
  // propio conteo independiente. Antes de este fix, dos limiters activos a la vez (ej. uno
  // global + el de login) compartian el mismo contador por IP, contaminandose entre si.
  const store: RateLimitStore = {};

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
