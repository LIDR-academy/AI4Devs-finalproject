import { Request, Response, NextFunction } from 'express';
import { NotFoundError, StockError, ValidationError } from '../types/errors';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log internally (never expose stack to client)
  console.error(err.message);

  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err instanceof StockError) {
    res.status(409).json({ error: err.message });
    return;
  }

  // Generic fallback — no internal details
  res.status(500).json({ error: 'Internal server error' });
}

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
}
