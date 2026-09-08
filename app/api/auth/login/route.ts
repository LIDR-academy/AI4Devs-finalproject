import { cookies } from "next/headers";
import { z } from "zod";

import { homeSurface, surfacePath } from "@/domain/auth/roles";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/http/session-cookie";
import { prismaAuthRepository } from "@/repositories/auth.repository.prisma";
import { login } from "@/use-cases/auth/login";

const INSTANCE = "/api/auth/login";

const LoginSchema = z.object({
  email: z.email("Introduce un email válido."),
  // Sin mínimo de longitud: al entrar, la contraseña o es la correcta o no lo es;
  // exigir formato aquí solo daría pistas sobre la política de contraseñas.
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export async function POST(request: Request) {
  try {
    const data = await parseJsonBody(request, LoginSchema);

    const { token, expiresAt, user } = await login(
      { repository: prismaAuthRepository },
      {
        email: data.email,
        password: data.password,
        userAgent: request.headers.get("user-agent"),
        // Detrás del proxy de la plataforma la IP real llega en X-Forwarded-For.
        ipAddress: request.headers.get("x-forwarded-for"),
      }
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(expiresAt));

    return Response.json({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      // El destino lo decide el servidor a partir del rol: el cliente no debería
      // tener que saber qué superficie corresponde a cada rol.
      redirectTo: surfacePath(homeSurface(user.role)),
    });
  } catch (error) {
    return toProblemResponse(error, INSTANCE);
  }
}
