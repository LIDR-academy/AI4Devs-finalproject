import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/domain/auth/password";
import {
  canEnterSurface,
  homeSurface,
  isRole,
  surfacePath,
  ROLES,
} from "@/domain/auth/roles";
import {
  generateSessionToken,
  hashSessionToken,
  isSessionActive,
  sessionExpiresAt,
  sessionTokenMatches,
} from "@/domain/auth/session";

describe("token de sesión", () => {
  it("genera tokens distintos e impredecibles", () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateSessionToken()));
    expect(tokens.size).toBe(50);
  });

  it("usa base64url, seguro en cookies y URLs", () => {
    expect(generateSessionToken()).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("hashea de forma determinista y no reversible a simple vista", () => {
    const token = generateSessionToken();
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
    expect(hashSessionToken(token)).not.toContain(token);
    expect(hashSessionToken(token)).toHaveLength(64); // SHA-256 en hexadecimal
  });

  it("compara hashes en tiempo constante sin romperse con longitudes distintas", () => {
    const hash = hashSessionToken("a");
    expect(sessionTokenMatches(hash, hash)).toBe(true);
    expect(sessionTokenMatches(hash, hashSessionToken("b"))).toBe(false);
    expect(sessionTokenMatches(hash, "abc")).toBe(false);
  });

  it("sitúa la caducidad a 7 días y la aplica en el límite exacto", () => {
    const issuedAt = new Date("2026-03-01T00:00:00.000Z");
    const expiresAt = sessionExpiresAt(issuedAt);
    expect(expiresAt.toISOString()).toBe("2026-03-08T00:00:00.000Z");

    expect(isSessionActive(expiresAt, new Date(expiresAt.getTime() - 1))).toBe(true);
    // Justo en el instante de caducidad la sesión ya NO vale.
    expect(isSessionActive(expiresAt, expiresAt)).toBe(false);
    expect(isSessionActive(expiresAt, new Date(expiresAt.getTime() + 1))).toBe(false);
  });
});

describe("contraseñas", () => {
  it("verifica la contraseña correcta y rechaza la incorrecta", async () => {
    const hash = await hashPassword("secreto");
    expect(await verifyPassword(hash, "secreto")).toBe(true);
    expect(await verifyPassword(hash, "Secreto")).toBe(false);
    expect(await verifyPassword(hash, "")).toBe(false);
  });

  it("usa argon2id y sal distinta en cada hash", async () => {
    const [first, second] = await Promise.all([hashPassword("secreto"), hashPassword("secreto")]);
    expect(first).toMatch(/^\$argon2id\$/);
    expect(first).not.toBe(second);
  });

  it("trata un hash corrupto como contraseña incorrecta, sin lanzar", async () => {
    expect(await verifyPassword("no-es-un-hash", "secreto")).toBe(false);
    expect(await verifyPassword("", "secreto")).toBe(false);
  });
});

describe("roles y superficies", () => {
  it("solo el suscriptor entra en el portal", () => {
    expect(canEnterSurface("SUBSCRIBER", "portal")).toBe(true);
    expect(canEnterSurface("OPERATOR", "portal")).toBe(false);
    expect(canEnterSurface("ADMIN", "portal")).toBe(false);
  });

  it("el back-office es de operador y admin, nunca del suscriptor", () => {
    expect(canEnterSurface("OPERATOR", "backoffice")).toBe(true);
    expect(canEnterSurface("ADMIN", "backoffice")).toBe(true);
    expect(canEnterSurface("SUBSCRIBER", "backoffice")).toBe(false);
  });

  it("cada rol tiene una superficie propia a la que puede entrar", () => {
    for (const role of ROLES) {
      expect(canEnterSurface(role, homeSurface(role))).toBe(true);
    }
  });

  it("mapea cada superficie a su ruta", () => {
    expect(surfacePath("portal")).toBe("/portal");
    expect(surfacePath("backoffice")).toBe("/backoffice");
  });

  it("no reconoce como rol al visitante ni a valores inventados", () => {
    // El visitante es el estado sin sesión, no un rol de cuenta (D13).
    expect(isRole("VISITOR")).toBe(false);
    expect(isRole("admin")).toBe(false);
    expect(isRole(null)).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});
