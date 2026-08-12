import { requireSession } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaNotificationRepository } from "@/repositories/notification.repository.prisma";

/** Buzón del usuario en sesión. `?unread=1` deja solo las pendientes de leer. */
export async function GET(request: Request) {
  try {
    const { user } = await requireSession();
    const unreadOnly = new URL(request.url).searchParams.get("unread") === "1";

    const notifications = await prismaNotificationRepository.listForUser(user.id, { unreadOnly });
    return Response.json({
      notifications,
      unread: notifications.filter((n) => n.readAt === null).length,
    });
  } catch (error) {
    return toProblemResponse(error, "/api/notifications");
  }
}
