import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { telemetry } from "../lib/telemetry";

const getClientIp = (req: Request) => {
  return req.ip || req.socket.remoteAddress || "unknown";
};

export const attachRequestContext = (req: Request, res: Response, next: NextFunction) => {
  const existingRequestId = req.header("x-request-id")?.trim();
  const requestId = existingRequestId || randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  next();
};

export const logRequestLifecycle = (req: Request, res: Response, next: NextFunction) => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const endedAt = process.hrtime.bigint();
    const durationMs = Number(endedAt - startedAt) / 1_000_000;

    telemetry.recordHttpRequest(res.statusCode);

    console.info(
      JSON.stringify({
        level: "info",
        message: "request.completed",
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
        actorId: req.actorId || null,
        ip: getClientIp(req)
      })
    );
  });

  next();
};
