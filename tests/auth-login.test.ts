import { beforeAll, describe, expect, it } from "vitest";

import { hashPassword } from "@/domain/auth/password";
import { hashSessionToken } from "@/domain/auth/session";
import { ForbiddenError, UnauthenticatedError } from "@/domain/errors";
import type { AuthUserWithSecret } from "@/repositories/auth.repository";
import { login, normalizeEmail } from "@/use-cases/auth/login";

import { FakeAuthRepository } from "./fakes/auth-repository";

const PASSWORD = "contraseña-correcta";

let subscriber: AuthUserWithSecret;
let suspended: AuthUserWithSecret;

beforeAll(async () => {
  const passwordHash = await hashPassword(PASSWORD);
  subscriber = {
    id: "user-1",
    email: "ana@example.test",
    fullName: "Ana Ruiz",
    role: "SUBSCRIBER",
    status: "ACTIVE",
    passwordHash,
  };
  suspended = { ...subscriber, id: "user-2", email: "baja@example.test", status: "SUSPENDED" };
});

function repositoryWithUsers() {
  return new FakeAuthRepository([subscriber, suspended]);
}

describe("login", () => {
  it("normaliza el email antes de buscar la cuenta", async () => {
    const repository = repositoryWithUsers();
    const result = await login({ repository }, { email: "  ANA@Example.TEST ", password: PASSWORD });
    expect(result.user.id).toBe("user-1");
    expect(normalizeEmail("  ANA@Example.TEST ")).toBe("ana@example.test");
  });

  it("persiste el hash del token, nunca el token en claro", async () => {
    const repository = repositoryWithUsers();
    const { token } = await login({ repository }, { email: subscriber.email, password: PASSWORD });

    expect(repository.sessions.has(token)).toBe(false);
    expect(repository.sessions.has(hashSessionToken(token))).toBe(true);
  });

  it("no devuelve el hash de la contraseña al llamante", async () => {
    const repository = repositoryWithUsers();
    const { user } = await login({ repository }, { email: subscriber.email, password: PASSWORD });
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("caduca la sesión a los 7 días del instante de emisión", async () => {
    const repository = repositoryWithUsers();
    const now = new Date("2026-03-01T10:00:00.000Z");
    const { expiresAt } = await login(
      { repository, now: () => now },
      { email: subscriber.email, password: PASSWORD }
    );
    expect(expiresAt.toISOString()).toBe("2026-03-08T10:00:00.000Z");
  });

  // ── Caminos de error ───────────────────────────────────────────────────────

  it("rechaza un email desconocido sin revelar que no existe", async () => {
    const repository = repositoryWithUsers();
    await expect(
      login({ repository }, { email: "nadie@example.test", password: PASSWORD })
    ).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("rechaza una contraseña incorrecta con el mismo error y mensaje", async () => {
    const repository = repositoryWithUsers();

    /** Ejecuta un login que se espera fallido y devuelve el error de dominio. */
    async function failedLogin(email: string, password: string) {
      try {
        await login({ repository }, { email, password });
        throw new Error("Se esperaba que el login fallara.");
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthenticatedError);
        return error as UnauthenticatedError;
      }
    }

    const unknown = await failedLogin("nadie@example.test", PASSWORD);
    const wrongPassword = await failedLogin(subscriber.email, "otra-cosa");

    // Si los dos caminos se distinguieran, el login sería un oráculo para saber qué
    // emails están dados de alta.
    expect(wrongPassword.code).toBe(unknown.code);
    expect(wrongPassword.message).toBe(unknown.message);
  });

  it("no crea sesión cuando las credenciales fallan", async () => {
    const repository = repositoryWithUsers();
    await expect(
      login({ repository }, { email: subscriber.email, password: "otra-cosa" })
    ).rejects.toBeInstanceOf(UnauthenticatedError);
    expect(repository.sessions.size).toBe(0);
  });

  it("bloquea una cuenta suspendida aunque la contraseña sea correcta", async () => {
    const repository = repositoryWithUsers();
    await expect(
      login({ repository }, { email: suspended.email, password: PASSWORD })
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(repository.sessions.size).toBe(0);
  });

  it("emite un token distinto en cada inicio de sesión", async () => {
    const repository = repositoryWithUsers();
    const first = await login({ repository }, { email: subscriber.email, password: PASSWORD });
    const second = await login({ repository }, { email: subscriber.email, password: PASSWORD });
    expect(first.token).not.toBe(second.token);
    expect(repository.sessions.size).toBe(2);
  });
});
