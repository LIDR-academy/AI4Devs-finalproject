import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

export const correlationId = (req: Request, res: Response, next: NextFunction) => {
  const headerValue = req.header("x-correlation-id");
  req.correlationId = headerValue && headerValue.trim().length > 0 ? headerValue : randomUUID();
  res.setHeader("x-correlation-id", req.correlationId);
  next();
};
