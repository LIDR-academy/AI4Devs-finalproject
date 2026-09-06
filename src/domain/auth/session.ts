import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Sesión opaca server-side (ADR-0002 §1) — lógica pura, sin Prisma ni HTTP.
 *
 * El token que viaja en la cookie es aleatorio y **no se persiste**: en la tabla
 * `sessions` solo se guarda su hash. Así, quien consiga un volcado de la base tiene
 * hashes inservibles para autenticarse, igual que con las contraseñas.
 */

/** 32 bytes de entropía: sobra para un identificador no adivinable. */
const TOKEN_BYTES = 32;

/** Duración absoluta de la sesión. No se renueva sola: al caducar hay que volver a entrar. */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Genera un token de sesión nuevo, en base64url (seguro en cookies y URLs). */
export function generateSessionToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/**
 * Hash del token para guardarlo/buscarlo en la base.
 *
 * SHA-256 a secas, **no** argon2: el token ya tiene 256 bits de entropía, así que no
 * hay nada que un ataque por diccionario pueda acortar, y el login tiene que
 * resolverlo en cada petición. Las contraseñas sí van con argon2id (`password.ts`)
 * porque las elige un humano.
 */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Compara dos hashes en tiempo constante, para no filtrar información por el reloj. */
export function sessionTokenMatches(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "hex");
  const bufferB = Buffer.from(b, "hex");
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

/** Instante de caducidad de una sesión creada en `issuedAt`. */
export function sessionExpiresAt(issuedAt: Date): Date {
  return new Date(issuedAt.getTime() + SESSION_TTL_MS);
}

/** Una sesión está viva mientras `now` sea anterior a su caducidad. */
export function isSessionActive(expiresAt: Date, now: Date): boolean {
  return expiresAt.getTime() > now.getTime();
}
