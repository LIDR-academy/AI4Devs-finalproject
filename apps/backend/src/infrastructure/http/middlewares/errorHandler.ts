import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/errors/DomainError.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
    return;
  }

  // Error no controlado / inesperado
  console.error('[Unhandled Exception]:', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'Ha ocurrido un error interno en el servidor.',
  });
}
