import { NextFunction, Request, Response } from "express";

type RateLimitCounter = {
  count: number;
  windowStartMs: number;
};

const counters = new Map<string, RateLimitCounter>();

const cleanupExpiredCounters = (windowMs: number) => {
  const now = Date.now();

  for (const [key, counter] of counters.entries()) {
    if (now - counter.windowStartMs > windowMs) {
      counters.delete(key);
    }
  }
};

const getClientKey = (req: Request) => {
  return req.ip || req.socket.remoteAddress || "unknown";
};

export const applySecurityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");

  next();
};

export const createRateLimiter = (windowMs: number, maxRequests: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (counters.size > 10_000) {
      cleanupExpiredCounters(windowMs);
    }

    const now = Date.now();
    const key = getClientKey(req);
    const current = counters.get(key);

    if (!current || now - current.windowStartMs > windowMs) {
      counters.set(key, {
        count: 1,
        windowStartMs: now
      });

      res.setHeader("RateLimit-Limit", String(maxRequests));
      res.setHeader("RateLimit-Remaining", String(maxRequests - 1));
      res.setHeader("RateLimit-Reset", String(Math.ceil((now + windowMs) / 1000)));
      return next();
    }

    current.count += 1;

    const remaining = Math.max(maxRequests - current.count, 0);
    const resetAt = current.windowStartMs + windowMs;

    res.setHeader("RateLimit-Limit", String(maxRequests));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(Math.ceil(resetAt / 1000)));

    if (current.count > maxRequests) {
      return res.status(429).json({
        message: "Too many requests. Please retry later."
      });
    }

    return next();
  };
};
