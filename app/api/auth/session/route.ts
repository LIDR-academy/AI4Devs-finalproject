import { permissionsOf } from "@/domain/auth/permissions";
import { currentSession } from "@/http/auth-context";
import { problem, problemResponse, toProblemResponse } from "@/http/problem";

const INSTANCE = "/api/auth/session";

/**
 * Sesión actual. El cliente la usa para saber si hay usuario y con qué rol pintar
 * la interfaz; la autorización de verdad se hace en el servidor, no con esta
 * respuesta.
 */
export async function GET() {
  try {
    const session = await currentSession();
    if (!session) {
      return problemResponse(
        problem("UNAUTHENTICATED", "No hay ninguna sesión activa.", {
          instance: INSTANCE,
        })
      );
    }

    const { user } = session;
    return Response.json({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      // Se envían los permisos, no solo el rol, para que el cliente decida qué
      // ofrecer preguntando por la acción. Es conveniencia de interfaz: el servidor
      // vuelve a comprobarlos en cada petición.
      permissions: permissionsOf(user.role),
    });
  } catch (error) {
    return toProblemResponse(error, INSTANCE);
  }
}
