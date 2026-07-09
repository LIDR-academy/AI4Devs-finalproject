import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const isHttpError = error instanceof HttpError;
  const statusCode = isHttpError ? error.statusCode : 500;
  const message = isHttpError ? error.message : "Internal server error";
  const correlationId = req.correlationId ?? "unknown";

  if (!isHttpError) {
    console.error(`correlationId=${correlationId} unexpectedError=`, error);
  }

  res.status(statusCode).json({
    error: {
      message,
      correlationId,
      ...(isHttpError && error.details ? { details: error.details } : {})
    }
  });
};
