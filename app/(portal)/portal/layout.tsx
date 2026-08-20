import { LogoutButton } from "@/components/auth/logout-button";
import { SurfaceNav } from "@/components/surface-nav";
import { NAV_LABEL, navFor } from "@/lib/navigation";
import { requireSurfacePage } from "@/http/auth-context";
import { prismaNotificationRepository } from "@/repositories/notification.repository.prisma";

/**
 * Portal del Suscriptor (rol SUBSCRIBER). El `proxy` ya corta el acceso antes de
 * llegar aquí; `requireSurfacePage` lo vuelve a comprobar para que ninguna página
 * protegida se renderice sin sesión aunque el matcher del proxy cambie (ADR-0001
 * §2-§3). El code-splitting por ruta mantiene el código de back-office fuera de
 * este bundle.
 *
 * La navegación de secciones vive aquí y no en las páginas (`wireframes.md` §2.3),
 * con los cinco destinos de W5. El contador de avisos sin leer es **el único adorno
 * numérico** de la cabecera, y se lo gana: es lo único que cambia sin que el
 * suscriptor haga nada (§7.1).
 */
export default async function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireSurfacePage("portal");
  const unread = await prismaNotificationRepository.countUnread(user.id);

  const destinations = navFor("portal", user.role).map((destination) =>
    destination.href === "/portal/avisos" && unread > 0
      ? {
          ...destination,
          badge: {
            count: unread,
            label: unread === 1 ? "1 aviso sin leer" : `${unread} avisos sin leer`,
          },
        }
      : destination
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6 border-b pb-2">
        <div className="flex items-center justify-between pb-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              Portal del suscriptor
            </p>
            <p className="text-sm font-medium">{user.fullName}</p>
          </div>
          <LogoutButton />
        </div>
        <SurfaceNav label={NAV_LABEL.portal} destinations={destinations} />
      </header>
      {children}
    </div>
  );
}
