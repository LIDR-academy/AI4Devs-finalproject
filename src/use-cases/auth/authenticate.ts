import { hashSessionToken, isSessionActive } from "@/domain/auth/session";
import type { AuthUser } from "@/repositories/auth.repository";

import type { AuthDeps } from "./login";

export interface AuthenticatedSession {
  sessionId: string;
  user: AuthUser;
}

/**
 * Resuelve el token de la cookie a la sesión y su usuario.
 *
 * Devuelve `null` —en vez de lanzar— en todos los casos de "no hay sesión válida":
 * quien llama decide si eso es un 401, una redirección al login o simplemente la
 * vista de visitante (D13), y esas tres respuestas son legítimas según el contexto.
 */
export async function authenticate(
  { repository, now = () => new Date() }: AuthDeps,
  token: string | undefined | null
): Promise<AuthenticatedSession | null> {
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const found = await repository.findSessionByTokenHash(tokenHash);
  if (!found) return null;

  const at = now();
  if (!isSessionActive(found.session.expiresAt, at)) {
    // Caducada: se borra en el acto en vez de esperar al barrido del scheduler,
    // así una cookie vieja no deja filas muertas acumulándose.
    await repository.deleteSessionByTokenHash(tokenHash);
    return null;
  }

  if (found.user.status === "SUSPENDED") return null;

  // Best-effort: la última actividad es informativa, no condiciona la caducidad.
  await repository.touchSession(found.session.id, at);

  return { sessionId: found.session.id, user: found.user };
}
