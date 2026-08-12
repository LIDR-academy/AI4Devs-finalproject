import { NotFoundError } from "@/domain/errors";
import { requireSession } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaNotificationRepository } from "@/repositories/notification.repository.prisma";

/**
 * Marca una notificación como leída.
 *
 * Solo puede ser del propio usuario, y eso lo garantiza el `WHERE` de la consulta: no
 * hay una comprobación previa que se pueda olvidar. Una notificación ajena responde
 * 404, igual que una inexistente.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const { notificationId } = await params;
  try {
    const { user } = await requireSession();

    const marked = await prismaNotificationRepository.markRead({
      notificationId,
      userId: user.id,
      at: new Date(),
    });
    // También cuando ya estaba leída: no hay nada que cambiar y el resultado
    // observable es el mismo.
    if (!marked) throw new NotFoundError("La notificación no existe o ya estaba leída.");

    return new Response(null, { status: 204 });
  } catch (error) {
    return toProblemResponse(error, `/api/notifications/${notificationId}/read`);
  }
}
