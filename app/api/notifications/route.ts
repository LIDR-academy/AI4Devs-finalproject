import { requireSession } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaNotificationRepository } from "@/repositories/notification.repository.prisma";

/** Buzón del usuario en sesión. `?unread=1` deja solo las pendientes de leer. */
export async function GET(request: Request) {
  try {
    const { user } = await requireSession();
    const unreadOnly = new URL(request.url).searchParams.get("unread") === "1";

    const [notifications, unread] = await Promise.all([
      prismaNotificationRepository.listForUser(user.id, { unreadOnly }),
      // Se cuenta en la base, no sobre la lista: `listForUser` viene recortada, así que
      // contar lo devuelto daba de menos a quien tuviera más pendientes que el tope —y
      // con `?unread=1` la cifra habría sido, además, el tamaño de la página.
      prismaNotificationRepository.countUnread(user.id),
    ]);

    return Response.json({ notifications, unread });
  } catch (error) {
    return toProblemResponse(error, "/api/notifications");
  }
}
