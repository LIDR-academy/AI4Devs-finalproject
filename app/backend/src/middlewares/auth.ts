import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { verifyAuthToken } from "../modules/auth/token";
import { authSessionStore } from "../modules/auth/session-store";

const DEV_FALLBACK_ACTOR_ID = "local-dev-actor";

const getBearerToken = (authHeader?: string) => {
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token?.trim()) {
    return null;
  }

  return token.trim();
};

export const attachActorContext = async (req: Request, res: Response, next: NextFunction) => {
  const bearerToken = getBearerToken(req.header("authorization"));

  if (bearerToken) {
    const payload = verifyAuthToken(bearerToken, env.AUTH_TOKEN_SECRET);

    if (!payload || payload.type !== "access") {
      return res.status(401).json({
        message: "Unauthorized: invalid or expired token"
      });
    }

    const identity = await authSessionStore.get(payload.sub);

    if (!identity || identity.sessionVersion !== payload.ver) {
      return res.status(401).json({
        message: "Unauthorized: session revoked"
      });
    }

    req.actorId = identity.actorId;
    req.actorName = identity.displayName;
    req.actorRole = identity.role;
    return next();
  }

  if (env.AUTH_ENABLED) {
    return res.status(401).json({
      message: "Unauthorized: login required"
    });
  }

  req.actorId = DEV_FALLBACK_ACTOR_ID;
  req.actorName = DEV_FALLBACK_ACTOR_ID;
  req.actorRole = "ADMIN";
  return next();
};
