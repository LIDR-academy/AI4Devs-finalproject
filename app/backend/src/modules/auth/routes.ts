import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env";
import { createAccessToken, createRefreshToken, verifyAuthToken } from "./token";
import { authSessionStore } from "./session-store";

const parseActorIds = (raw: string) => {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

authSessionStore.configureRoleMapping({
  superAdminIds: parseActorIds(env.AUTH_SUPERADMIN_ACTOR_IDS),
  adminIds: parseActorIds(env.AUTH_ADMIN_ACTOR_IDS)
});

const loginSchema = z.object({
  actorId: z.string().trim().min(3).max(80),
  displayName: z.string().trim().min(1).max(100).optional(),
  password: z.string().min(1)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

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

const buildTokenPair = (input: {
  actorId: string;
  displayName: string;
  role: "SUPERADMIN" | "ADMIN" | "USER";
  sessionVersion: number;
}) => {
  const now = Math.floor(Date.now() / 1000);
  const accessExpiresAt = now + env.AUTH_TOKEN_TTL_SECONDS;
  const refreshExpiresAt = now + env.AUTH_REFRESH_TOKEN_TTL_SECONDS;

  const accessToken = createAccessToken(
    {
      sub: input.actorId,
      name: input.displayName,
      role: input.role,
      ver: input.sessionVersion,
      iat: now,
      exp: accessExpiresAt
    },
    env.AUTH_TOKEN_SECRET
  );

  const refreshToken = createRefreshToken(
    {
      sub: input.actorId,
      name: input.displayName,
      role: input.role,
      ver: input.sessionVersion,
      iat: now,
      exp: refreshExpiresAt
    },
    env.AUTH_TOKEN_SECRET
  );

  return {
    accessToken,
    refreshToken,
    accessExpiresAt
  };
};

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);

    if (payload.password !== env.AUTH_LOGIN_PASSWORD) {
      return res.status(401).json({
        message: "Credenciales invalidas"
      });
    }

    const displayName = payload.displayName ?? payload.actorId;
    const identity = await authSessionStore.getOrCreate(payload.actorId, displayName);
    const tokenPair = buildTokenPair({
      actorId: payload.actorId,
      displayName,
      role: identity.role,
      sessionVersion: identity.sessionVersion,
    });

    return res.status(200).json({
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenType: "Bearer",
      expiresAt: new Date(tokenPair.accessExpiresAt * 1000).toISOString(),
      actor: {
        id: payload.actorId,
        displayName,
        role: identity.role
      }
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const payload = refreshSchema.parse(req.body);
    const tokenPayload = verifyAuthToken(payload.refreshToken, env.AUTH_TOKEN_SECRET);

    if (!tokenPayload || tokenPayload.type !== "refresh") {
      return res.status(401).json({
        message: "Refresh token invalido o expirado"
      });
    }

    const identity = await authSessionStore.get(tokenPayload.sub);

    if (!identity || identity.sessionVersion !== tokenPayload.ver) {
      return res.status(401).json({
        message: "Refresh token invalido o revocado"
      });
    }

    const tokenPair = buildTokenPair({
      actorId: tokenPayload.sub,
      displayName: tokenPayload.name,
      role: identity.role,
      sessionVersion: identity.sessionVersion,
    });

    return res.status(200).json({
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenType: "Bearer",
      expiresAt: new Date(tokenPair.accessExpiresAt * 1000).toISOString(),
      actor: {
        id: tokenPayload.sub,
        displayName: tokenPayload.name,
        role: identity.role
      }
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (req, res) => {
  const bearerToken = getBearerToken(req.header("authorization"));

  if (!bearerToken) {
    return res.status(204).send();
  }

  const tokenPayload = verifyAuthToken(bearerToken, env.AUTH_TOKEN_SECRET);

  if (!tokenPayload || tokenPayload.type !== "access") {
    return res.status(204).send();
  }

  const identity = await authSessionStore.get(tokenPayload.sub);

  if (!identity || identity.sessionVersion !== tokenPayload.ver) {
    return res.status(204).send();
  }

  await authSessionStore.rotate(tokenPayload.sub);
  return res.status(204).send();
});
