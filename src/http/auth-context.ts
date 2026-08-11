import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { can, type Permission } from "@/domain/auth/permissions";
import {
  canEnterSurface,
  homeSurface,
  surfacePath,
  type Surface,
} from "@/domain/auth/roles";
import { ForbiddenError, UnauthenticatedError } from "@/domain/errors";
import { prismaAuthRepository } from "@/repositories/auth.repository.prisma";
import {
  authenticate,
  type AuthenticatedSession,
} from "@/use-cases/auth/authenticate";

import { SESSION_COOKIE_NAME } from "./session-cookie";

/**
 * Acceso a la sesión desde Route Handlers y Server Components.
 *
 * El `proxy` corta el tráfico por superficie, pero **no** sustituye a estas
 * comprobaciones: el proxy no cubre las llamadas directas a `/api/*`, así que cada
 * handler vuelve a exigir lo suyo. Es la misma frontera comprobada dos veces, que es
 * exactamente lo que se quiere de una frontera de seguridad.
 */

export async function currentSession(): Promise<AuthenticatedSession | null> {
  const cookieStore = await cookies();
  return authenticate(
    { repository: prismaAuthRepository },
    cookieStore.get(SESSION_COOKIE_NAME)?.value
  );
}

/** Exige sesión. Lanza `UnauthenticatedError` (401) si no la hay. */
export async function requireSession(): Promise<AuthenticatedSession> {
  const session = await currentSession();
  if (!session) throw new UnauthenticatedError("Necesitas iniciar sesión.");
  return session;
}

/** Exige sesión con acceso a una superficie. Lanza 401 si falta, 403 si el rol no llega. */
export async function requireSurface(surface: Surface): Promise<AuthenticatedSession> {
  const session = await requireSession();
  if (!canEnterSurface(session.user.role, surface)) {
    throw new ForbiddenError("Tu rol no tiene acceso a esta sección.");
  }
  return session;
}

/**
 * Exige un **permiso concreto** (matriz de PRD §3). Es el guarda que deben usar los
 * Route Handlers: preguntan por la acción, no por el rol, de modo que un cambio en la
 * matriz no obliga a repasar los handlers uno a uno.
 *
 * 401 si no hay sesión y 403 si la hay pero no alcanza: son cosas distintas y el
 * cliente reacciona distinto (ir al login vs. avisar de que no se puede).
 */
export async function requirePermission(
  permission: Permission
): Promise<AuthenticatedSession> {
  const session = await requireSession();
  if (!can(session.user.role, permission)) {
    throw new ForbiddenError("Tu rol no permite realizar esta acción.");
  }
  return session;
}

/**
 * Variante para Server Components: en vez de lanzar, **redirige**. Un 500 con una
 * excepción no es respuesta para una navegación; sí lo es mandar al login o a la
 * superficie que sí corresponde al rol.
 *
 * En la práctica el `proxy` ya habrá cortado antes; esto es el respaldo que garantiza
 * que ninguna página protegida se renderice sin sesión aunque el matcher cambie.
 */
export async function requireSurfacePage(surface: Surface): Promise<AuthenticatedSession> {
  const session = await currentSession();
  if (!session) redirect("/login");
  if (!canEnterSurface(session.user.role, surface)) {
    redirect(surfacePath(homeSurface(session.user.role)));
  }
  return session;
}
