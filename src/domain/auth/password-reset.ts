import { createHash, randomBytes } from "node:crypto";

/**
 * Enlace de restablecimiento de contraseña — lógica pura, sin Prisma ni HTTP.
 *
 * Es la misma figura que la sesión opaca de `session.ts`: un secreto portador que
 * viaja al usuario y del que en la base **solo se guarda el hash**. Quien consiga un
 * volcado no puede fabricar un enlace válido con lo que hay dentro.
 *
 * La diferencia con la sesión está en la vida: esta caduca en una hora y se gasta al
 * primer uso, porque su portador no es el navegador de nadie sino un mensaje de correo
 * que puede quedarse en un buzón para siempre.
 */

/** 32 bytes de entropía, igual que la sesión: nada que un diccionario pueda acortar. */
const TOKEN_BYTES = 32;

/**
 * Una hora. Suficiente para leer un correo y elegir una contraseña; corto de más para
 * que el enlace olvidado en un buzón siga sirviendo mañana.
 */
export const RESET_TTL_MS = 60 * 60 * 1000;

/** Ruta de la pantalla que consume el enlace. Vive aquí para que solo se escriba una vez. */
export const RESET_PATH = "/restablecer-contrasena";

/** Genera un token nuevo, en base64url (seguro dentro de una URL). */
export function generateResetToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/**
 * Hash del token para guardarlo y buscarlo. SHA-256 a secas y **no** argon2, por lo
 * mismo que el token de sesión: la entropía ya la pone el generador, y hay que
 * resolverlo por búsqueda directa cuando alguien abre el enlace.
 */
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Instante de caducidad de un enlace emitido en `issuedAt`. */
export function resetExpiresAt(issuedAt: Date): Date {
  return new Date(issuedAt.getTime() + RESET_TTL_MS);
}

/**
 * Un enlace sirve mientras no haya caducado **y** no se haya gastado.
 *
 * Las dos condiciones se responden juntas a propósito: quien llama no debe poder
 * distinguir "caducado" de "ya usado", porque el error que se devuelve es el mismo
 * (design.md §7) y separarlas invitaría a contarlo de dos maneras distintas.
 */
export function isResetTokenUsable(
  token: { expiresAt: Date; usedAt: Date | null },
  now: Date
): boolean {
  return token.usedAt === null && token.expiresAt.getTime() > now.getTime();
}

/** Enlace completo que viaja en el correo. `baseUrl` llega ya resuelto desde la capa HTTP. */
export function resetLink(baseUrl: string, token: string): string {
  // `URLSearchParams` y no interpolación: el token es base64url y no necesita escape
  // hoy, pero confiar en eso es apostar a que el alfabeto nunca cambie.
  const query = new URLSearchParams({ token });
  return `${baseUrl.replace(/\/+$/, "")}${RESET_PATH}?${query}`;
}
