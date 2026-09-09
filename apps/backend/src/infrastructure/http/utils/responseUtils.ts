import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

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

/**
 * Handler de `catch` compartido para controllers: un `ZodError` se traduce a
 * `respondValidationError` (400), cualquier otra excepción sigue al `errorHandler`
 * central vía `next`. Antes duplicado entre `locations.controller.ts` y
 * `consumption-reasons.controller.ts` (TK-107).
 */
export function handleZodOrNext(req: Request, res: Response, next: NextFunction, err: unknown): void {
  if (err instanceof z.ZodError) {
    respondValidationError(req, res, err.errors.map((e) => e.message).join('; '));
    return;
  }
  next(err);
}

/**
 * Convierte `startDate`/`endDate` de query string (ISO 8601 opcional) a `Date` — mismo
 * patrón repetido en cualquier endpoint de histórico filtrable por rango de fechas.
 * Extraído (TK-120) tras el gate de duplicación detectarlo entre
 * `stock.controller.ts#getMovementHistory` y `temperature-logs.controller.ts`.
 */
export function parseDateRangeQuery(query: { startDate?: string; endDate?: string }): {
  startDate?: Date;
  endDate?: Date;
} {
  return {
    startDate: query.startDate ? new Date(query.startDate) : undefined,
    endDate: query.endDate ? new Date(query.endDate) : undefined,
  };
}
