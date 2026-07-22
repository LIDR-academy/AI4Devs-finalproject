import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAccessToken } from "../modules/auth/token";

vi.mock("../modules/auth/session-store", () => ({
  authSessionStore: {
    get: vi.fn()
  }
}));

import { authSessionStore } from "../modules/auth/session-store";

const loadAttachActorContext = async (authEnabled: boolean) => {
  vi.resetModules();
  vi.doMock("../config/env", () => ({
    env: {
      AUTH_ENABLED: authEnabled,
      AUTH_TOKEN_SECRET: "test-token-secret-value",
      AUTH_LOGIN_PASSWORD: "test-pass-123",
      AUTH_TOKEN_TTL_SECONDS: 3600
    }
  }));

  const authModule = await import("./auth");
  return authModule.attachActorContext;
};

const createRequest = (headers: Record<string, string | undefined>) => {
  return {
    header: (name: string) => headers[name.toLowerCase()]
  };
};

const createResponse = () => {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
  };

  return response;
};

describe("attachActorContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.unmock("../config/env");
  });

  it("returns 401 when auth is enabled and token is missing", async () => {
    const attachActorContext = await loadAttachActorContext(true);
    const req = createRequest({}) as unknown as { actorId?: string; header: (name: string) => string | undefined };
    const res = createResponse();
    const next = vi.fn();

    await attachActorContext(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized: login required"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches actor from bearer token when auth is enabled", async () => {
    const attachActorContext = await loadAttachActorContext(true);
    const token = createAccessToken(
      {
        sub: "actor-123",
        name: "Actor Test",
        role: "ADMIN",
        ver: 1,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      },
      "test-token-secret-value"
    );

    vi.mocked(authSessionStore.get).mockResolvedValueOnce({
      actorId: "actor-123",
      displayName: "Actor Test",
      role: "ADMIN",
      sessionVersion: 1
    } as never);

    const req = createRequest({ authorization: `Bearer ${token}` }) as unknown as {
      actorId?: string;
      actorName?: string;
      actorRole?: string;
      header: (name: string) => string | undefined;
    };
    const res = createResponse();
    const next = vi.fn();

    await attachActorContext(req as never, res as never, next);

    expect(req.actorId).toBe("actor-123");
    expect(req.actorName).toBe("Actor Test");
    expect(req.actorRole).toBe("ADMIN");
    expect(next).toHaveBeenCalledOnce();
  });

  it("returns 401 when access token was revoked", async () => {
    const attachActorContext = await loadAttachActorContext(true);
    const token = createAccessToken(
      {
        sub: "actor-123",
        name: "Actor Test",
        role: "ADMIN",
        ver: 1,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      },
      "test-token-secret-value"
    );

    vi.mocked(authSessionStore.get).mockResolvedValueOnce({
      actorId: "actor-123",
      displayName: "Actor Test",
      role: "ADMIN",
      sessionVersion: 2
    } as never);

    const req = createRequest({ authorization: `Bearer ${token}` }) as unknown as {
      actorId?: string;
      header: (name: string) => string | undefined;
    };
    const res = createResponse();
    const next = vi.fn();

    await attachActorContext(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized: session revoked"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when bearer token is invalid", async () => {
    const attachActorContext = await loadAttachActorContext(true);
    const req = createRequest({ authorization: "Bearer invalid-token" }) as unknown as {
      actorId?: string;
      header: (name: string) => string | undefined;
    };
    const res = createResponse();
    const next = vi.fn();

    await attachActorContext(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized: invalid or expired token"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("falls back to local dev actor when auth is disabled", async () => {
    const attachActorContext = await loadAttachActorContext(false);
    const req = createRequest({}) as unknown as { actorId?: string; header: (name: string) => string | undefined };
    const res = createResponse();
    const next = vi.fn();

    await attachActorContext(req as never, res as never, next);

    expect(req.actorId).toBe("local-dev-actor");
    expect(next).toHaveBeenCalledOnce();
  });
});
