import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const isHttpError = error instanceof HttpError;
  const statusCode = isHttpError ? error.statusCode : 500;
  const message = isHttpError ? error.message : "Internal server error";

  if (!isHttpError) {
    console.error(
      `correlationId=${req.correlationId} method=${req.method} path=${req.originalUrl} unexpectedError=`,
      error
    );
  }

  res.status(statusCode).json({
    error: {
      message,
      correlationId: req.correlationId,
      ...(isHttpError && error.details ? { details: error.details } : {})
    }
  });
};
