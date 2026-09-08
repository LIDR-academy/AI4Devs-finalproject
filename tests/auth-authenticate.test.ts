import { beforeAll, describe, expect, it } from "vitest";

import { hashPassword } from "@/domain/auth/password";
import { generateSessionToken, hashSessionToken } from "@/domain/auth/session";
import type { AuthUserWithSecret } from "@/repositories/auth.repository";
import { authenticate } from "@/use-cases/auth/authenticate";
import { login } from "@/use-cases/auth/login";

import { FakeAuthRepository } from "./fakes/auth-repository";

const PASSWORD = "contraseña-correcta";
const LOGIN_AT = new Date("2026-03-01T10:00:00.000Z");

let user: AuthUserWithSecret;

beforeAll(async () => {
  user = {
    id: "user-1",
    email: "ana@example.test",
    fullName: "Ana Ruiz",
    role: "SUBSCRIBER",
    status: "ACTIVE",
    passwordHash: await hashPassword(PASSWORD),
  };
});

async function loggedIn(users: AuthUserWithSecret[] = [user]) {
  const repository = new FakeAuthRepository(users);
  const { token } = await login(
    { repository, now: () => LOGIN_AT },
    { email: users[0].email, password: PASSWORD }
  );
  return { repository, token };
}

describe("authenticate", () => {
  it("resuelve el usuario de una sesión viva", async () => {
    const { repository, token } = await loggedIn();
    const session = await authenticate(
      { repository, now: () => new Date("2026-03-02T10:00:00.000Z") },
      token
    );
    expect(session?.user.id).toBe("user-1");
    expect(session?.user).not.toHaveProperty("passwordHash");
  });

  it("registra la última actividad de la sesión", async () => {
    const { repository, token } = await loggedIn();
    const at = new Date("2026-03-02T10:00:00.000Z");
    await authenticate({ repository, now: () => at }, token);
    expect(repository.touched).toEqual([{ sessionId: "session-1", at }]);
  });

  // ── Caminos de error ───────────────────────────────────────────────────────

  it("devuelve null sin token", async () => {
    const repository = new FakeAuthRepository([user]);
    expect(await authenticate({ repository }, undefined)).toBeNull();
    expect(await authenticate({ repository }, null)).toBeNull();
    expect(await authenticate({ repository }, "")).toBeNull();
  });

  it("devuelve null con un token que no corresponde a ninguna sesión", async () => {
    const { repository } = await loggedIn();
    expect(await authenticate({ repository }, generateSessionToken())).toBeNull();
  });

  it("devuelve null y borra la sesión cuando ha caducado", async () => {
    const { repository, token } = await loggedIn();
    // Un instante después de los 7 días de vida.
    const afterExpiry = new Date("2026-03-08T10:00:00.001Z");

    expect(await authenticate({ repository, now: () => afterExpiry }, token)).toBeNull();
    expect(repository.sessions.has(hashSessionToken(token))).toBe(false);
  });

  it("acepta la sesión en el último milisegundo antes de caducar", async () => {
    const { repository, token } = await loggedIn();
    const justBefore = new Date("2026-03-08T09:59:59.999Z");
    expect(await authenticate({ repository, now: () => justBefore }, token)).not.toBeNull();
  });

  it("rechaza la sesión si la cuenta se suspende después de iniciarla", async () => {
    const { repository, token } = await loggedIn();
    // La sesión sigue siendo válida, pero la cuenta ya no: manda el estado actual.
    const suspended = { ...user, status: "SUSPENDED" as const };
    const withSuspended = new FakeAuthRepository([suspended]);
    for (const [hash, session] of repository.sessions) {
      withSuspended.sessions.set(hash, session);
    }

    expect(await authenticate({ repository: withSuspended }, token)).toBeNull();
  });
});
