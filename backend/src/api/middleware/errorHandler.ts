import type { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../domain/errors/DomainError';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import pino from 'pino';
import { env } from '../../infrastructure/config/env';

const logger = pino({ level: env.LOG_LEVEL });

/**
 * Error handling middleware (T017). Maps domain errors → HTTP codes; logs and sanitises the rest.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof DomainError) {
    res.status(err.httpStatus).json({
      error: err.code,
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'DUPLICATE', message: 'Recurso duplicado' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Recurso no encontrado' });
      return;
    }
  }

  logger.error({ err, path: req.path, method: req.method }, 'unhandled error');
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Error interno del servidor',
  });
}
