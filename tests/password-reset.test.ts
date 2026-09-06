import { beforeEach, describe, expect, it } from "vitest";

import { hashPassword } from "@/domain/auth/password";
import { hashResetToken } from "@/domain/auth/password-reset";
import { ResetTokenInvalidError, UnauthenticatedError } from "@/domain/errors";
import type { DomainEvent } from "@/domain/notifications/events";
import type { EmailMessage, Mailer } from "@/mail/mailer";
import type { AuthUserWithSecret } from "@/repositories/auth.repository";
import { login } from "@/use-cases/auth/login";
import { requestPasswordReset } from "@/use-cases/auth/request-password-reset";
import { resetPassword } from "@/use-cases/auth/reset-password";

import { FakeAuthRepository } from "./fakes/auth-repository";
import { FakePasswordResetRepository } from "./fakes/password-reset-repository";

const BASE_URL = "https://clickoteca.test";
const OLD_PASSWORD = "la-de-siempre";
const NEW_PASSWORD = "una-contraseña-nueva";
const NOW = new Date("2026-03-01T10:00:00.000Z");

/** Doble del transporte de correo: guarda lo enviado y puede fallar a voluntad. */
class FakeMailer implements Mailer {
  readonly sent: EmailMessage[] = [];
  fails = false;

  async send(message: EmailMessage) {
    if (this.fails) throw new Error("transporte caído");
    this.sent.push(message);
  }

  /** El token tal como lo recibiría quien abre el correo. */
  get token(): string {
    const last = this.sent.at(-1);
    if (!last) throw new Error("No se envió ningún correo.");
    const link = last.text.split("\n").find((line) => line.startsWith("http"));
    return new URL(link!).searchParams.get("token")!;
  }
}

let users: AuthUserWithSecret[];
let auth: FakeAuthRepository;
let resets: FakePasswordResetRepository;
let mailer: FakeMailer;
let events: DomainEvent[];

async function deps() {
  return {
    auth,
    resets,
    mailer,
    emit: async (event: DomainEvent) => void events.push(event),
    now: () => NOW,
  };
}

beforeEach(async () => {
  const passwordHash = await hashPassword(OLD_PASSWORD);
  users = [
    {
      id: "user-1",
      email: "ana@example.test",
      fullName: "Ana Ruiz",
      role: "SUBSCRIBER",
      status: "ACTIVE",
      passwordHash,
    },
    {
      id: "user-2",
      email: "baja@example.test",
      fullName: "Carlos Soto",
      role: "SUBSCRIBER",
      status: "SUSPENDED",
      passwordHash,
    },
  ];
  auth = new FakeAuthRepository(users);
  resets = new FakePasswordResetRepository(users);
  mailer = new FakeMailer();
  events = [];
});

describe("solicitar el enlace", () => {
  it("envía el enlace a la dirección de la cuenta y deja constancia del aviso", async () => {
    await requestPasswordReset(await deps(), { email: "ana@example.test", baseUrl: BASE_URL });

    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].to).toBe("ana@example.test");
    expect(mailer.sent[0].text).toContain(`${BASE_URL}/restablecer-contrasena?token=`);
    expect(resets.live).toHaveLength(1);
    expect(events).toEqual([
      expect.objectContaining({ type: "password-reset.requested", userId: "user-1" }),
    ]);
  });

  it("guarda el hash del token, nunca el token que viaja en el correo", async () => {
    await requestPasswordReset(await deps(), { email: "ana@example.test", baseUrl: BASE_URL });

    const token = mailer.token;
    // Buscar por el token en claro no encuentra nada; por su hash, sí.
    expect(await resets.findByTokenHash(token)).toBeNull();
    expect(await resets.findByTokenHash(hashResetToken(token))).not.toBeNull();
  });

  it("el aviso del buzón no lleva el enlace dentro", async () => {
    await requestPasswordReset(await deps(), { email: "ana@example.test", baseUrl: BASE_URL });

    // Quien vea el buzón —o la tabla— no debe poder completar el restablecimiento.
    expect(JSON.stringify(events)).not.toContain(mailer.token);
  });

  it("normaliza el email antes de buscar la cuenta", async () => {
    await requestPasswordReset(await deps(), { email: "  ANA@Example.TEST ", baseUrl: BASE_URL });
    expect(mailer.sent).toHaveLength(1);
  });

  it("una solicitud nueva invalida la anterior", async () => {
    await requestPasswordReset(await deps(), { email: "ana@example.test", baseUrl: BASE_URL });
    const primerEnlace = mailer.token;
    await requestPasswordReset(await deps(), { email: "ana@example.test", baseUrl: BASE_URL });

    expect(resets.tokens).toHaveLength(2);
    expect(resets.live).toHaveLength(1);
    // Solo vale el último: quien pide el correo dos veces usa el que acaba de llegar.
    await expect(
      resetPassword({ auth, resets, now: () => NOW }, { token: primerEnlace, password: NEW_PASSWORD })
    ).rejects.toBeInstanceOf(ResetTokenInvalidError);
  });

  // ── Caminos de error ───────────────────────────────────────────────────────

  it("no envía nada ni deja rastro si la dirección no tiene cuenta", async () => {
    await requestPasswordReset(await deps(), { email: "nadie@example.test", baseUrl: BASE_URL });

    expect(mailer.sent).toHaveLength(0);
    expect(resets.tokens).toHaveLength(0);
    expect(events).toHaveLength(0);
  });

  it("no envía nada a una cuenta suspendida: restablecer no levanta la suspensión", async () => {
    await requestPasswordReset(await deps(), { email: "baja@example.test", baseUrl: BASE_URL });

    expect(mailer.sent).toHaveLength(0);
    expect(resets.tokens).toHaveLength(0);
  });

  it("responde igual exista o no la cuenta", async () => {
    const conCuenta = await requestPasswordReset(await deps(), {
      email: "ana@example.test",
      baseUrl: BASE_URL,
    });
    const sinCuenta = await requestPasswordReset(await deps(), {
      email: "nadie@example.test",
      baseUrl: BASE_URL,
    });

    // Si el resultado se distinguiera, la pantalla de recuperación diría qué emails
    // están dados de alta — justo lo que el login evita desde el primer día.
    expect(conCuenta).toBe(sinCuenta);
  });

  it("un fallo del correo no propaga y no deja el enlace suelto", async () => {
    mailer.fails = true;

    // Propagarlo daría un 500 solo para las direcciones que existen, que es otra forma
    // de contar cuáles son.
    await expect(
      requestPasswordReset(await deps(), { email: "ana@example.test", baseUrl: BASE_URL })
    ).resolves.toBeUndefined();

    expect(resets.live).toHaveLength(0);
    expect(events).toHaveLength(0);
  });
});

describe("usar el enlace", () => {
  async function solicitar() {
    await requestPasswordReset(await deps(), { email: "ana@example.test", baseUrl: BASE_URL });
    events = [];
    return mailer.token;
  }

  it("cambia la contraseña: entra la nueva y deja de entrar la vieja", async () => {
    const token = await solicitar();
    await resetPassword({ auth, resets, now: () => NOW }, { token, password: NEW_PASSWORD });

    const { user } = await login({ repository: auth }, {
      email: "ana@example.test",
      password: NEW_PASSWORD,
    });
    expect(user.id).toBe("user-1");

    await expect(
      login({ repository: auth }, { email: "ana@example.test", password: OLD_PASSWORD })
    ).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("cierra todas las sesiones abiertas de la cuenta", async () => {
    await login({ repository: auth }, { email: "ana@example.test", password: OLD_PASSWORD });
    await login({ repository: auth }, { email: "ana@example.test", password: OLD_PASSWORD });
    expect(auth.sessions.size).toBe(2);

    const token = await solicitar();
    const { revokedSessions } = await resetPassword(
      { auth, resets, now: () => NOW },
      { token, password: NEW_PASSWORD }
    );

    // Si el olvido venía de una cuenta robada, dejar vivas las sesiones abiertas sería
    // dejar dentro justo a quien se quiere echar.
    expect(revokedSessions).toBe(2);
    expect(auth.sessions.size).toBe(0);
  });

  it("deja constancia del cambio en el buzón", async () => {
    const token = await solicitar();
    await resetPassword(
      { auth, resets, emit: async (event) => void events.push(event), now: () => NOW },
      { token, password: NEW_PASSWORD }
    );

    expect(events).toEqual([
      expect.objectContaining({ type: "password.changed", userId: "user-1" }),
    ]);
  });

  // ── Caminos de error ───────────────────────────────────────────────────────

  it("no se puede usar dos veces", async () => {
    const token = await solicitar();
    await resetPassword({ auth, resets, now: () => NOW }, { token, password: NEW_PASSWORD });

    await expect(
      resetPassword({ auth, resets, now: () => NOW }, { token, password: "otra-mas" })
    ).rejects.toBeInstanceOf(ResetTokenInvalidError);

    // Y el segundo intento no ha tocado la contraseña que dejó el primero.
    await expect(
      login({ repository: auth }, { email: "ana@example.test", password: NEW_PASSWORD })
    ).resolves.toBeDefined();
  });

  it("rechaza un enlace caducado", async () => {
    const token = await solicitar();
    const unaHoraDespues = new Date(NOW.getTime() + 60 * 60 * 1000);

    await expect(
      resetPassword({ auth, resets, now: () => unaHoraDespues }, { token, password: NEW_PASSWORD })
    ).rejects.toBeInstanceOf(ResetTokenInvalidError);
  });

  it("rechaza un token inventado con el mismo error y mensaje que uno caducado", async () => {
    const token = await solicitar();
    const caducado = new Date(NOW.getTime() + 60 * 60 * 1000);

    /** Ejecuta un restablecimiento que se espera fallido y devuelve el error. */
    async function fallo(input: { token: string; now: Date }) {
      try {
        await resetPassword(
          { auth, resets, now: () => input.now },
          { token: input.token, password: NEW_PASSWORD }
        );
        throw new Error("Se esperaba que el restablecimiento fallara.");
      } catch (error) {
        expect(error).toBeInstanceOf(ResetTokenInvalidError);
        return error as ResetTokenInvalidError;
      }
    }

    const inventado = await fallo({ token: "no-existe", now: NOW });
    const vencido = await fallo({ token, now: caducado });

    // Distinguirlos convertiría el endpoint en un oráculo para sondear tokens.
    expect(inventado.code).toBe(vencido.code);
    expect(inventado.message).toBe(vencido.message);
  });

  it("un enlace inválido no cambia la contraseña ni cierra sesiones", async () => {
    await login({ repository: auth }, { email: "ana@example.test", password: OLD_PASSWORD });

    await expect(
      resetPassword({ auth, resets, now: () => NOW }, { token: "no-existe", password: NEW_PASSWORD })
    ).rejects.toBeInstanceOf(ResetTokenInvalidError);

    expect(auth.sessions.size).toBe(1);
    await expect(
      login({ repository: auth }, { email: "ana@example.test", password: OLD_PASSWORD })
    ).resolves.toBeDefined();
  });
});
