import { hashSessionToken } from "@/domain/auth/session";

import type { AuthDeps } from "./login";

/**
 * Cierra la sesión borrando su fila: con sesión server-side la revocación es
 * inmediata y total, sin listas negras (ADR-0002, "por qué no JWT").
 *
 * Es idempotente: cerrar una sesión inexistente o ya cerrada no es un error, porque
 * el resultado para quien llama es el mismo — no hay sesión.
 */
export async function logout(
  { repository }: AuthDeps,
  token: string | undefined | null
): Promise<void> {
  if (!token) return;
  await repository.deleteSessionByTokenHash(hashSessionToken(token));
}
