import { cookies } from "next/headers";

import { toProblemResponse } from "@/http/problem";
import {
  SESSION_COOKIE_NAME,
  clearedSessionCookieOptions,
} from "@/http/session-cookie";
import { prismaAuthRepository } from "@/repositories/auth.repository.prisma";
import { logout } from "@/use-cases/auth/logout";

const INSTANCE = "/api/auth/logout";

/**
 * Cierra la sesión. Responde 204 siempre que la operación se complete, haya o no
 * sesión previa: el resultado observable —no hay sesión— es el mismo, y así el
 * cliente no necesita distinguir casos para limpiar su estado.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    await logout(
      { repository: prismaAuthRepository },
      cookieStore.get(SESSION_COOKIE_NAME)?.value
    );

    cookieStore.set(SESSION_COOKIE_NAME, "", clearedSessionCookieOptions());
    return new Response(null, { status: 204 });
  } catch (error) {
    return toProblemResponse(error, INSTANCE);
  }
}
