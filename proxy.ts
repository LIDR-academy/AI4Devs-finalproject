import { NextResponse, type NextRequest } from "next/server";

import { decideSurfaceAccess } from "@/domain/auth/access";
import { surfacePath, type Surface } from "@/domain/auth/roles";
import { SESSION_COOKIE_NAME } from "@/http/session-cookie";
import { prismaAuthRepository } from "@/repositories/auth.repository.prisma";
import { authenticate } from "@/use-cases/auth/authenticate";

/**
 * Proxy de auth (Next 16 renombró `middleware` → `proxy`).
 *
 * Es la **frontera de autorización por superficie** (ADR-0002 §1): resuelve la cookie
 * de sesión contra la base y decide antes de que se ejecute ninguna página.
 *
 *   /portal/*      → sesión con rol SUBSCRIBER
 *   /backoffice/*  → sesión con rol OPERATOR o ADMIN
 *
 * No cubre `/api/*` a propósito: allí cada handler exige lo suyo con
 * `requireSession`/`requireSurface`, que es donde debe estar la comprobación cuando
 * la llamada no pasa por una navegación.
 *
 * Puede consultar la base porque en Next 16 el `proxy` corre **siempre** en el
 * runtime Node —a diferencia del antiguo `middleware`, que era Edge por defecto y
 * donde Prisma no funcionaba—. Declarar `runtime` aquí es, de hecho, un error de
 * build.
 */

const SURFACE_BY_PREFIX: ReadonlyArray<[string, Surface]> = [
  ["/portal", "portal"],
  ["/backoffice", "backoffice"],
];

function surfaceFor(pathname: string): Surface | null {
  const match = SURFACE_BY_PREFIX.find(([prefix]) => pathname.startsWith(prefix));
  return match ? match[1] : null;
}

function redirectToLogin(request: NextRequest): NextResponse {
  const url = new URL("/login", request.url);
  // Se conserva el destino para volver ahí tras entrar; solo la ruta relativa, para
  // que un `next` manipulado no pueda convertirse en un *open redirect*.
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const surface = surfaceFor(request.nextUrl.pathname);
  if (!surface) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await authenticate({ repository: prismaAuthRepository }, token);

  // La política vive en el dominio (`decideSurfaceAccess`), que es puro y testable;
  // aquí solo se ejecuta la decisión.
  const decision = decideSurfaceAccess(session?.user.role, surface);

  switch (decision.kind) {
    case "allow":
      return NextResponse.next();
    case "authenticate":
      return redirectToLogin(request);
    case "redirect":
      return NextResponse.redirect(new URL(surfacePath(decision.to), request.url));
  }
}

export const config = {
  matcher: ["/portal/:path*", "/backoffice/:path*"],
};
