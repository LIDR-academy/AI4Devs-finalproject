import type { Role } from "./roles";

/**
 * Matriz de permisos por acción (PRD §3, spec `accounts-roles`).
 *
 * **Fuente única de verdad de la autorización.** Todo lo demás —la frontera de
 * superficies de `roles.ts`, los guardas HTTP, lo que el cliente pinta o esconde—
 * se deriva de esta tabla, para que añadir un rol o una acción sea un cambio en un
 * solo sitio.
 *
 * Se autoriza por **acción**, no por rol: los handlers preguntan "¿puede dar de baja
 * una copia?" y no "¿es admin?". Así, el día que cambie quién puede hacer qué, no hay
 * que ir a buscar comprobaciones de rol repartidas por el código.
 *
 * El visitante no aparece: no tiene cuenta ni rol (D13). Sin sesión no hay permiso
 * alguno, que es justo lo que expresa `can()` al no recibir rol.
 */

export const PERMISSIONS = [
  // Superficies (ADR-0001 §3).
  "portal.access",
  "backoffice.access",

  // Suscriptor.
  "account.manage",
  "rental.request",
  "queue.join",
  "offer.respond",
  "return.initiate",

  // Operación del inventario y del catálogo.
  "set.manage",
  "set.publish",
  "copy.create",
  "copy.advance_lifecycle",
  "incident.mark",

  // Historial de cliente: lectura limitada para soporte vs. completa.
  "customer.read_limited",
  "customer.read_full",

  // Exclusivas de admin.
  "copy.retire",
  "settings.manage",
  "employee.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const SUBSCRIBER_PERMISSIONS = [
  "portal.access",
  "account.manage",
  "rental.request",
  "queue.join",
  "offer.respond",
  "return.initiate",
] as const satisfies readonly Permission[];

const OPERATOR_PERMISSIONS = [
  "backoffice.access",
  // Catalogar sets es trabajo de inventario; **publicarlos** no, porque decide qué ve
  // el público y la spec lo pone en manos del admin.
  "set.manage",
  "copy.create",
  "copy.advance_lifecycle",
  "incident.mark",
  // Soporte por teléfono/correo: ve el historial, no el perfil completo (D6).
  "customer.read_limited",
] as const satisfies readonly Permission[];

/**
 * El admin hace **todo lo del operador** y además lo suyo (spec `accounts-roles`),
 * así que se construye a partir del operador en vez de repetir la lista: una acción
 * nueva del operador no puede olvidarse de dársela al admin.
 */
const ADMIN_PERMISSIONS = [
  ...OPERATOR_PERMISSIONS,
  // "WHEN el admin intenta publicar un Set…" (spec `catalog-inventory`).
  "set.publish",
  "customer.read_full",
  // Decisión con impacto económico: el operador detecta y marca, el admin confirma (D6).
  "copy.retire",
  "settings.manage",
  "employee.manage",
] as const satisfies readonly Permission[];

const PERMISSIONS_BY_ROLE: Record<Role, readonly Permission[]> = {
  SUBSCRIBER: SUBSCRIBER_PERMISSIONS,
  OPERATOR: OPERATOR_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
};

/**
 * ¿Puede este rol ejecutar esta acción? Sin rol (visitante) la respuesta es siempre
 * `false`: el acceso público se concede por rutas explícitas, nunca por permiso.
 */
export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return PERMISSIONS_BY_ROLE[role].includes(permission);
}

/** Todos los permisos de un rol. Útil para que el cliente sepa qué ofrecer. */
export function permissionsOf(role: Role): readonly Permission[] {
  return PERMISSIONS_BY_ROLE[role];
}
