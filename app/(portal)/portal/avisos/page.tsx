import { Badge } from "@/components/ui/badge";
import { requireSurfacePage } from "@/http/auth-context";
import { notificationLabel } from "@/lib/status";
import { prismaNotificationRepository } from "@/repositories/notification.repository.prisma";

import { MarkReadButton } from "./notification-actions";

export const metadata = { title: "Avisos" };

const DATE = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" });

/**
 * Buzón del suscriptor — `wireframes.md` §7.5.
 *
 * Los tipos se traducen: en la base el aviso se llama `QUEUE_TURN`; en pantalla, "Te
 * toca un set de tu cola". Esa tabla vive en `lib/status.ts` con el resto del
 * vocabulario, no aquí.
 */
export default async function PortalAvisosPage() {
  const { user } = await requireSurfacePage("portal");
  const notifications = await prismaNotificationRepository.listForUser(user.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Avisos</h1>

      {notifications.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">Nada nuevo.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((notification) => {
            const label = notificationLabel(notification.type);
            const unread = notification.readAt === null;
            return (
              <li
                key={notification.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm"
              >
                <div className="space-y-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className={unread ? "font-medium" : undefined}>{label}</span>
                    {/* El sin leer se marca con texto, no solo con la negrita: el peso
                        de la letra no lo puede llevar la información (WCAG 1.4.1). */}
                    {unread ? <Badge tone="info">Sin leer</Badge> : null}
                  </p>
                  <p className="text-[var(--muted-foreground)]">
                    {DATE.format(notification.sentAt)}
                  </p>
                </div>
                {unread ? (
                  <MarkReadButton notificationId={notification.id} subject={label} />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
