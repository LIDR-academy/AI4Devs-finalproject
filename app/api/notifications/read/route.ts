import { requireSession } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaNotificationRepository } from "@/repositories/notification.repository.prisma";

const INSTANCE = "/api/notifications/read";

/**
 * Marca como leídos **todos** los avisos sin leer del usuario en sesión.
 *
 * El destinatario sale de la sesión y nunca del cuerpo: no hay forma de vaciar el
 * buzón de otro, ni siquiera por un fallo de comprobación, porque no existe el
 * parámetro con el que pedirlo. Es la misma regla que el marcado individual, donde el
 * `userId` viaja en el `WHERE`.
 *
 * **Cero no es un error, a diferencia del marcado individual** —que responde 404
 * cuando el aviso ya estaba leído—. Allí quien llama señaló una fila concreta y se
 * encontró con que no había nada que cambiar; aquí pidió "deja el buzón a cero", y un
 * buzón que ya estaba a cero cumple lo que se pidió. Devolver el recuento deja que la
 * pantalla diga cuántos eran sin tener que contarlos ella.
 */
export async function POST() {
  try {
    const { user } = await requireSession();

    const marked = await prismaNotificationRepository.markAllRead({
      userId: user.id,
      at: new Date(),
    });

    return Response.json({ marked });
  } catch (error) {
    return toProblemResponse(error, INSTANCE);
  }
}
