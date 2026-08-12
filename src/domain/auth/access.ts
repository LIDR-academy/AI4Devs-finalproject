import { canEnterSurface, homeSurface, type Role, type Surface } from "./roles";

/**
 * Política de acceso a las superficies (D13 / spec `accounts-roles`).
 *
 * Se expresa como una **función pura** —de rol y superficie a decisión— en vez de
 * vivir enterrada en el `proxy`: así la regla se puede probar entera, incluido el
 * caso del visitante, sin levantar Next ni fabricar peticiones.
 */

export type AccessDecision =
  /** Puede pasar. */
  | { kind: "allow" }
  /** No hay sesión: el visitante debe identificarse (D13). */
  | { kind: "authenticate" }
  /** Hay sesión, pero la superficie no es la suya: se le lleva a la que sí lo es. */
  | { kind: "redirect"; to: Surface };

export function decideSurfaceAccess(
  role: Role | null | undefined,
  surface: Surface
): AccessDecision {
  // Sin cuenta no hay acceso a ninguna superficie: el visitante solo tiene las rutas
  // públicas (catálogo, planes y alta), que ni siquiera pasan por esta decisión.
  if (!role) return { kind: "authenticate" };

  if (canEnterSurface(role, surface)) return { kind: "allow" };

  // Enseñar un 403 seco a quien sí tiene cuenta sería un callejón sin salida; se le
  // devuelve a su propia superficie, que es donde puede hacer algo.
  return { kind: "redirect", to: homeSurface(role) };
}
