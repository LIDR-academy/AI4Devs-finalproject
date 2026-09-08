"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { isCurrentDestination, type NavDestination } from "@/lib/navigation";

/**
 * Barra de secciones de una superficie (`documents/wireframes.md` §2.3).
 *
 * Es cliente por una sola razón: marcar el destino activo necesita la ruta actual.
 * Los destinos llegan ya filtrados por permiso desde el layout, que es servidor, así
 * que la matriz de permisos no viaja al navegador.
 *
 * **Rutas, no pestañas.** Cada destino tiene su URL, es enlazable y recargable; por
 * eso son `<a>` dentro de un `<nav>` y no `role="tab"`. El activo se anuncia con
 * `aria-current="page"`, que es lo que hace que el color no sea la única señal.
 *
 * En móvil la fila se desplaza en horizontal en vez de esconderse tras una
 * hamburguesa: cinco destinos caben desplazándose y un menú los pondría a un toque
 * de distancia sin ganar nada.
 */
export function SurfaceNav({
  label,
  destinations,
}: {
  label: string;
  destinations: readonly NavDestination[];
}) {
  const pathname = usePathname();

  // Con un solo destino no hay nada que navegar: la barra sería un adorno que
  // siempre apunta a donde ya estás. Se pinta cuando haya a dónde ir — hoy, el
  // portal (§8.5); el día que W5 añada sus rutas, sola.
  if (destinations.length < 2) return null;

  return (
    <nav aria-label={label} className="-mx-1 overflow-x-auto">
      <ul className="flex min-w-max items-center gap-1 px-1 py-1 text-sm">
        {destinations.map((destination) => {
          const current = isCurrentDestination(destination, pathname);
          return (
            <li key={destination.href}>
              <Link
                href={destination.href}
                aria-current={current ? "page" : undefined}
                // Con contador, el nombre accesible lo dice con palabras: el número
                // suelto se anunciaría como "Avisos 3" y no significa nada.
                aria-label={
                  destination.badge ? `${destination.label}: ${destination.badge.label}` : undefined
                }
                className={cn(
                  "block whitespace-nowrap rounded-md px-3 py-1.5 transition-colors outline-none",
                  "focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]",
                  current
                    ? "bg-[var(--accent)] font-medium text-[var(--accent-foreground)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                {destination.label}
                {destination.badge ? (
                  <span
                    aria-hidden="true"
                    className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--tone-warning)] px-1.5 py-0.5 text-xs font-medium text-[var(--tone-warning-foreground)]"
                  >
                    {destination.badge.count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
