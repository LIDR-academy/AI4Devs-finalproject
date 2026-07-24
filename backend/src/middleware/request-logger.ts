import type { NextFunction, Request, Response } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.info(
      `correlationId=${req.correlationId} method=${req.method} path=${req.originalUrl} status=${res.statusCode} durationMs=${durationMs}`
    );
  });

  next();
};
