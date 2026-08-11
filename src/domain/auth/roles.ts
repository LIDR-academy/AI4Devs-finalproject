import { can, type Permission } from "./permissions";

/**
 * Modelo de roles (D6 / spec `accounts-roles`): una cuenta = **exactamente un** rol.
 *
 * El visitante NO aparece aquí: es el estado sin sesión, no un rol de cuenta (D13).
 * Este módulo aporta el vocabulario de roles y superficies; **quién puede qué** vive
 * en `permissions.ts`, del que aquí solo se deriva.
 */

export const ROLES = ["SUBSCRIBER", "OPERATOR", "ADMIN"] as const;

export type Role = (typeof ROLES)[number];

/** Superficies de la aplicación segmentadas por rol (route groups, ADR-0001 §3). */
export type Surface = "portal" | "backoffice";

/** Entrar en una superficie es, simplemente, otro permiso de la matriz. */
const SURFACE_PERMISSION: Record<Surface, Permission> = {
  portal: "portal.access",
  backoffice: "backoffice.access",
};

export function canEnterSurface(role: Role, surface: Surface): boolean {
  return can(role, SURFACE_PERMISSION[surface]);
}

/** Superficie a la que pertenece cada rol; destino natural tras iniciar sesión. */
export function homeSurface(role: Role): Surface {
  return role === "SUBSCRIBER" ? "portal" : "backoffice";
}

/** Ruta de entrada de cada superficie. */
export function surfacePath(surface: Surface): string {
  return surface === "portal" ? "/portal" : "/backoffice";
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
