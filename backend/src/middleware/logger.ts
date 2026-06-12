import morgan from 'morgan';
import { Request, Response } from 'express';

// Custom token that masks checkout body to avoid logging PII
export const skipBody = (req: Request): boolean => {
  return req.path.startsWith('/api/checkout');
};

export const loggerMiddleware = morgan('combined', {
  skip: (_req: Request, res: Response) => res.statusCode < 400,
});

export const requestLoggerMiddleware = morgan(':method :url :status :response-time ms', {
  // We never log the body — this format only logs method, url, status, timing
});
