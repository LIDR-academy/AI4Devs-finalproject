import { afterEach, describe, expect, it } from "vitest";

import {
  RESET_TTL_MS,
  generateResetToken,
  hashResetToken,
  isResetTokenUsable,
  resetExpiresAt,
  resetLink,
} from "@/domain/auth/password-reset";
import { resolveBaseUrl } from "@/http/base-url";
import { passwordResetEmail } from "@/mail/messages";

const NOW = new Date("2026-03-01T10:00:00.000Z");

describe("token de restablecimiento", () => {
  it("emite un token distinto cada vez", () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateResetToken()));
    expect(tokens.size).toBe(50);
  });

  it("emite el token en base64url, seguro dentro de una URL", () => {
    const token = generateResetToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(encodeURIComponent(token)).toBe(token);
  });

  it("hashea de forma estable y sin devolver el token en claro", () => {
    const token = generateResetToken();
    expect(hashResetToken(token)).toBe(hashResetToken(token));
    expect(hashResetToken(token)).not.toBe(token);
    expect(hashResetToken(token)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("caduca a la hora de emitirse", () => {
    expect(resetExpiresAt(NOW).getTime() - NOW.getTime()).toBe(RESET_TTL_MS);
    expect(resetExpiresAt(NOW).toISOString()).toBe("2026-03-01T11:00:00.000Z");
  });

  it("acepta un enlace vigente y sin gastar", () => {
    expect(isResetTokenUsable({ expiresAt: resetExpiresAt(NOW), usedAt: null }, NOW)).toBe(true);
  });

  // ── Caminos de error ───────────────────────────────────────────────────────

  it("rechaza un enlace caducado", () => {
    const expiresAt = resetExpiresAt(NOW);
    const later = new Date(expiresAt.getTime() + 1);
    expect(isResetTokenUsable({ expiresAt, usedAt: null }, later)).toBe(false);
  });

  it("rechaza el enlace justo en el instante de caducidad, no un milisegundo después", () => {
    const expiresAt = resetExpiresAt(NOW);
    expect(isResetTokenUsable({ expiresAt, usedAt: null }, expiresAt)).toBe(false);
  });

  it("rechaza un enlace ya gastado aunque siga en plazo", () => {
    expect(
      isResetTokenUsable({ expiresAt: resetExpiresAt(NOW), usedAt: NOW }, NOW)
    ).toBe(false);
  });
});

describe("enlace de restablecimiento", () => {
  it("apunta a la pantalla de restablecer con el token en la consulta", () => {
    const link = new URL(resetLink("https://clickoteca.vercel.app", "abc-123"));
    expect(link.pathname).toBe("/restablecer-contrasena");
    expect(link.searchParams.get("token")).toBe("abc-123");
  });

  it("no duplica la barra cuando la URL base ya la trae", () => {
    expect(resetLink("https://clickoteca.vercel.app/", "t")).toBe(
      resetLink("https://clickoteca.vercel.app", "t")
    );
  });
});

describe("correo de restablecimiento", () => {
  const message = passwordResetEmail({
    to: "ana@example.test",
    fullName: "Ana Ruiz",
    link: "https://clickoteca.vercel.app/restablecer-contrasena?token=secreto",
    expiresAt: new Date("2026-03-01T11:00:00.000Z"),
  });

  it("lleva el enlace y la hora de caducidad en el huso del destinatario", () => {
    expect(message.text).toContain(
      "https://clickoteca.vercel.app/restablecer-contrasena?token=secreto"
    );
    // 11:00 UTC del 1 de marzo son las 12:00 en Madrid.
    expect(message.text).toContain("1/3/26, 12:00");
  });

  it("dice qué hacer a quien no lo ha pedido", () => {
    expect(message.text).toContain("Si no has sido tú");
  });

  it("no revela nada de la cuenta salvo el nombre", () => {
    // El asunto viaja en claro por cualquier servidor de correo del camino: no debe
    // llevar dentro ni la dirección ni el enlace.
    expect(message.subject).not.toContain("ana@example.test");
    expect(message.subject).not.toContain("secreto");
  });
});

describe("URL base del enlace", () => {
  const previous = process.env.APP_URL;

  afterEach(() => {
    if (previous === undefined) delete process.env.APP_URL;
    else process.env.APP_URL = previous;
  });

  it("prefiere APP_URL sobre lo que diga la petición", () => {
    process.env.APP_URL = "https://clickoteca.vercel.app/";
    const request = new Request("http://interno:3000/api/auth/password-reset", {
      headers: { host: "atacante.example" },
    });
    // Sin esta preferencia, la cabecera `Host` —que la pone quien llama— decidiría a
    // qué dominio apunta el enlace que recibe la víctima.
    expect(resolveBaseUrl(request)).toBe("https://clickoteca.vercel.app");
  });

  it("cae a las cabeceras del proxy cuando no hay APP_URL", () => {
    delete process.env.APP_URL;
    const request = new Request("http://interno:3000/api/auth/password-reset", {
      headers: { host: "interno:3000", "x-forwarded-proto": "https", "x-forwarded-host": "preview.vercel.app" },
    });
    expect(resolveBaseUrl(request)).toBe("https://preview.vercel.app");
  });

  it("usa el origen de la petición cuando no hay nada más", () => {
    delete process.env.APP_URL;
    const request = new Request("http://localhost:3000/api/auth/password-reset");
    expect(resolveBaseUrl(request)).toBe("http://localhost:3000");
  });
});
