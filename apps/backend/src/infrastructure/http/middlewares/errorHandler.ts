import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/errors/DomainError.js';

/**
 * Middleware centralizado de errores configurado bajo el estándar RFC 7807 Problem Details.
 * Incluye alias 'error' y 'message' para compatibilidad total con la suite de tests existente.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof DomainError) {
    const errorSlug = err.name.toLowerCase().replace(/error|exception/g, '');
    res.status(err.statusCode).json({
      type: `https://restostock.com/errors/${errorSlug}`,
      title: err.name,
      status: err.statusCode,
      detail: err.message,
      instance: req.originalUrl || req.url,
      // Propiedades de retrocompatibilidad (RFC 7807 extended)
      error: err.name,
      message: err.message,
    });
    return;
  }

  // Error no controlado / inesperado
  console.error('[Unhandled Exception]:', err);
  res.status(500).json({
    type: 'https://restostock.com/errors/internal-server-error',
    title: 'InternalServerError',
    status: 500,
    detail: 'Ha ocurrido un error interno en el servidor.',
    instance: req.originalUrl || req.url,
    error: 'InternalServerError',
    message: 'Ha ocurrido un error interno en el servidor.',
  });
}
