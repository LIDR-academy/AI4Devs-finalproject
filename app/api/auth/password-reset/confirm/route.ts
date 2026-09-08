import { z } from "zod";

import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaAuthRepository } from "@/repositories/auth.repository.prisma";
import { prismaNotificationRepository } from "@/repositories/notification.repository.prisma";
import { prismaPasswordResetRepository } from "@/repositories/password-reset.repository.prisma";
import { emitterFor } from "@/use-cases/notifications/notify";
import { resetPassword } from "@/use-cases/auth/reset-password";

const INSTANCE = "/api/auth/password-reset/confirm";

const ConfirmSchema = z
  .object({
    token: z.string().min(1, "Falta el enlace de restablecimiento."),
    // El mismo mínimo que el alta: no tendría sentido que el restablecimiento
    // aceptara contraseñas que el registro rechaza.
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    passwordConfirmation: z.string().min(1, "Repite la contraseña."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    // La comprobación se repite en el servidor aunque el formulario ya la haga: el
    // borde no puede fiarse de lo que le llegue, y aquí el error es irreversible —
    // una errata al teclear deja la cuenta con una contraseña que nadie conoce.
    path: ["passwordConfirmation"],
    message: "Las dos contraseñas no coinciden.",
  });

/**
 * Consume el enlace y fija la contraseña nueva.
 *
 * Un fallo de validación se resuelve **antes** de tocar el token: quien se equivoca
 * escribiendo la contraseña puede corregir con el mismo enlace, sin pedir otro.
 */
export async function POST(request: Request) {
  try {
    const data = await parseJsonBody(request, ConfirmSchema);

    await resetPassword(
      {
        auth: prismaAuthRepository,
        resets: prismaPasswordResetRepository,
        emit: emitterFor({ notifications: prismaNotificationRepository }),
      },
      { token: data.token, password: data.password }
    );

    // No se abre sesión: acaban de cerrarse todas, incluida la que abriría este
    // proceso. Entrar con la contraseña nueva es la comprobación de que funcionó.
    return Response.json({ redirectTo: "/login" });
  } catch (error) {
    return toProblemResponse(error, INSTANCE);
  }
}
