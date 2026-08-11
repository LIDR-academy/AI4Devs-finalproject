/**
 * Modelo de roles (D6 / spec `accounts-roles`): una cuenta = **exactamente un** rol.
 *
 * El visitante NO aparece aquí: es el estado sin sesión, no un rol de cuenta (D13).
 * Aquí solo vive la frontera "a qué superficie puede entrar cada rol"; la matriz de
 * permisos por acción es la tarea 2.2.
 */

export const ROLES = ["SUBSCRIBER", "OPERATOR", "ADMIN"] as const;

export type Role = (typeof ROLES)[number];

/** Superficies de la aplicación segmentadas por rol (route groups, ADR-0001 §3). */
export type Surface = "portal" | "backoffice";

const SURFACE_ROLES: Record<Surface, readonly Role[]> = {
  // El back-office es del personal; un suscriptor nunca entra.
  backoffice: ["OPERATOR", "ADMIN"],
  // El portal es del cliente. Operador y admin no lo usan: su cuenta no tiene
  // suscripción ni alquileres, así que se les manda a su propia superficie.
  portal: ["SUBSCRIBER"],
};

export function canEnterSurface(role: Role, surface: Surface): boolean {
  return SURFACE_ROLES[surface].includes(role);
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
