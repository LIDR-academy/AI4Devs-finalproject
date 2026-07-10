import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    message: "Route not found",
    requestId: _req.requestId
  });
};

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const requestId = req.requestId;

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? "Validation error";
    res.status(400).json({ message, requestId });
    return;
  }

  const error = err as { statusCode?: number; message?: string };
  const statusCode = error.statusCode ?? 500;
  const message = error.message ?? "Internal server error";

  console.error(
    JSON.stringify({
      level: "error",
      message: "request.failed",
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      errorMessage: message
    })
  );

  res.status(statusCode).json({ message, requestId });
};
