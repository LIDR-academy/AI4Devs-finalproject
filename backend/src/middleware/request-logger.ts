import type { NextFunction, Request, Response } from "express";

const sanitizeLogValue = (value: unknown) => String(value ?? "-").replace(/[\r\n]/g, "_");

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const correlationId = sanitizeLogValue(req.correlationId);
    const path = sanitizeLogValue(req.originalUrl);

    console.info(
      `correlationId=${correlationId} method=${req.method} path=${path} status=${res.statusCode} durationMs=${durationMs}`
    );
  });

  next();
};
