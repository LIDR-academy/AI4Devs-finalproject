/**
 * Navegación de superficie — `documents/wireframes.md` §2.3 y §8.5.
 *
 * Los destinos de cada superficie se declaran **aquí y solo aquí**. Antes la del
 * back-office vivía dentro de `backoffice/page.tsx`, así que existía en el centro y
 * no en las secciones: para ir de `/backoffice/clientes` a `/backoffice/empleados`
 * había que volver al hub. Subirla al layout arregla eso; declararla en un módulo
 * evita el problema siguiente, que es tener dos listas de secciones que se separan.
 *
 * Quién ve cada destino se deriva de la **matriz de permisos** (`permissions.ts`),
 * nunca de una comprobación de rol: si mañana el operador puede tocar la
 * configuración, la nav se entera sola.
 *
 * Mientras faltaban pantallas, los destinos sin ruta se declaraban aquí igualmente y
 * se filtraban con una marca `pending`, para que el orden de la barra fuese una
 * decisión de diseño y no el orden de implementación. Con W4 y W5 ya no queda ninguno
 * y la marca se ha retirado; si vuelve a hacer falta, es dos líneas.
 *
 * Módulo de presentación, como `lib/status.ts`: lo importan `app/` y `components/`,
 * jamás `src/`.
 */

import { can, type Permission } from "@/domain/auth/permissions";
import type { Role, Surface } from "@/domain/auth/roles";

export interface NavDestination {
  readonly href: string;
  readonly label: string;
  /** Sin permiso no se pinta. Ausente = lo ve cualquiera que entre en la superficie. */
  readonly permission?: Permission;
  /**
   * Contador junto a la etiqueta. Lo pone quien pinta la barra, no la declaración: es
   * un dato vivo. **El número no viaja solo** — lleva su texto para quien no lo ve.
   */
  readonly badge?: { count: number; label: string };
}

/** Portal del suscriptor. Los cinco destinos existen desde W5 (§7). */
const PORTAL: readonly NavDestination[] = [
  { href: "/portal", label: "Resumen" },
  { href: "/portal/sets", label: "Mis sets" },
  { href: "/portal/historial", label: "Historial" },
  { href: "/portal/suscripcion", label: "Suscripción" },
  { href: "/portal/avisos", label: "Avisos" },
];

/** Back-office. Los cinco destinos existen desde W4 (§6). */
const BACKOFFICE: readonly NavDestination[] = [
  { href: "/backoffice", label: "Cola de trabajo" },
  { href: "/backoffice/catalogo", label: "Catálogo", permission: "set.manage" },
  { href: "/backoffice/clientes", label: "Clientes", permission: "customer.read_limited" },
  {
    href: "/backoffice/configuracion",
    label: "Configuración",
    permission: "settings.manage",
  },
  { href: "/backoffice/empleados", label: "Personal", permission: "employee.manage" },
];

const DESTINATIONS: Record<Surface, readonly NavDestination[]> = {
  portal: PORTAL,
  backoffice: BACKOFFICE,
};

/** Nombre accesible de la barra: dos `<nav>` distintos nunca comparten etiqueta. */
export const NAV_LABEL: Record<Surface, string> = {
  portal: "Portal",
  backoffice: "Back-office",
};

/** Los destinos que este rol puede ver hoy, en el orden declarado. */
export function navFor(surface: Surface, role: Role): readonly NavDestination[] {
  return DESTINATIONS[surface].filter(
    (destination) => destination.permission === undefined || can(role, destination.permission)
  );
}

/**
 * ¿Es este el destino en el que estamos? El de la raíz de la superficie exige
 * coincidencia exacta —si no, `/backoffice` marcaría activas todas sus secciones—;
 * los demás aceptan subrutas, para que la ficha de un cliente siga iluminando
 * `Clientes` en vez de dejar la barra sin ningún activo.
 */
export function isCurrentDestination(destination: NavDestination, pathname: string): boolean {
  const isSurfaceRoot = destination.href.split("/").length === 2;
  if (isSurfaceRoot) return pathname === destination.href;
  return pathname === destination.href || pathname.startsWith(`${destination.href}/`);
}
