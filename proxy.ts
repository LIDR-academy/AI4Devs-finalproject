import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy de auth (esqueleto — tarea 2.1/2.2). En Next 16 el antiguo `middleware` se
 * llama `proxy`.
 *
 * Traza la frontera de superficies por rol (ADR-0001 §2-§3):
 *   - /portal/*      → requiere sesión con rol SUBSCRIBER
 *   - /backoffice/*  → requiere sesión con rol OPERATOR o ADMIN
 *
 * Aún NO hay autenticación implementada, así que de momento deja pasar todo. La
 * lógica real (leer cookie de sesión — ADR-0002, resolver rol, redirigir a login o
 * responder 401/403) se conecta al implementar `accounts-roles`.
 */
export function proxy(_request: NextRequest) {
  // TODO(2.1): validar cookie de sesión y autorizar por rol antes de continuar.
  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/backoffice/:path*"],
};
