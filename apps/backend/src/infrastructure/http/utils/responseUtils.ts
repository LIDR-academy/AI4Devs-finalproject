import { Request, Response } from 'express';

/**
 * Emite una respuesta de error de validación estandarizada bajo el formato RFC 7807 Problem Details.
 * Incluye propiedades de retrocompatibilidad ('error' y 'message') para la suite de pruebas.
 */
export function respondValidationError(req: Request, res: Response, detailMsg: string): void {
  res.status(400).json({
    type: 'https://restostock.com/errors/validation-error',
    title: 'ValidationError',
    status: 400,
    detail: detailMsg,
    instance: req.originalUrl || req.url,
    error: 'ValidationError',
    message: detailMsg,
  });
}
