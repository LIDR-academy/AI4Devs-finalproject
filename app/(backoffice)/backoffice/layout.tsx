import { LogoutButton } from "@/components/auth/logout-button";
import { SurfaceNav } from "@/components/surface-nav";
import { NAV_LABEL, navFor } from "@/lib/navigation";
import { roleLabel } from "@/lib/status";
import { requireSurfacePage } from "@/http/auth-context";

/**
 * Back-office (roles OPERATOR / ADMIN). Segmentado por rol vía route group + `proxy`
 * de auth, con `requireSurfacePage` como respaldo en el propio render (ADR-0001
 * §2-§3): su código no viaja al navegador del suscriptor sin autorización.
 *
 * La navegación de secciones estaba dentro de la cola de trabajo, así que existía en
 * el centro y no en las secciones (`wireframes.md` §8.5). Aquí está en las cinco, y
 * los destinos que el rol no puede usar ni se pintan.
 */
export default async function BackofficeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireSurfacePage("backoffice");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 border-b pb-2">
        <div className="flex items-center justify-between pb-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              Back-office
            </p>
            <p className="text-sm font-medium">
              {user.fullName} · {roleLabel(user.role)}
            </p>
          </div>
          <LogoutButton />
        </div>
        <SurfaceNav label={NAV_LABEL.backoffice} destinations={navFor("backoffice", user.role)} />
      </header>
      {children}
    </div>
  );
}
