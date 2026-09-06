import { z } from "zod";

import { ValidationError } from "@/domain/errors";
import { resolveBaseUrl } from "@/http/base-url";
import { toProblemResponse } from "@/http/problem";
import { consoleMailer } from "@/mail/console-mailer";
import { prismaAuthRepository } from "@/repositories/auth.repository.prisma";
import { prismaNotificationRepository } from "@/repositories/notification.repository.prisma";
import { prismaPasswordResetRepository } from "@/repositories/password-reset.repository.prisma";
import { emitterFor } from "@/use-cases/notifications/notify";
import { requestPasswordReset } from "@/use-cases/auth/request-password-reset";

const INSTANCE = "/api/auth/password-reset";

const RequestSchema = z.object({
  email: z.email("Introduce un email válido."),
});

/**
 * Pide un enlace de restablecimiento.
 *
 * **202 y el mismo cuerpo siempre**: haya cuenta, esté suspendida o no exista nadie
 * con esa dirección. Un 404 —o un cuerpo distinto— convertiría esta pantalla en el
 * oráculo de enumeración que el login evita desde el primer día (ADR-0002 §1).
 *
 * El 202 no es cosmético: dice literalmente lo que ocurre. La petición se acepta y
 * **lo que pase después no se cuenta aquí**.
 */
export async function POST(request: Request) {
  try {
    const raw: unknown = await request.json().catch(() => {
      throw new ValidationError(
        [{ field: "body", issue: "Se esperaba un cuerpo JSON." }],
        "Petición mal formada."
      );
    });

    const parsed = RequestSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => ({
          field: issue.path.join(".") || "body",
          issue: issue.message,
        }))
      );
    }

    await requestPasswordReset(
      {
        auth: prismaAuthRepository,
        resets: prismaPasswordResetRepository,
        mailer: consoleMailer(),
        emit: emitterFor({ notifications: prismaNotificationRepository }),
      },
      {
        email: parsed.data.email,
        baseUrl: resolveBaseUrl(request),
        ipAddress: request.headers.get("x-forwarded-for"),
      }
    );

    return Response.json(
      {
        // El texto no afirma que la cuenta exista. Es el mismo en los tres casos.
        message:
          "Si esa dirección tiene una cuenta, te hemos enviado un enlace para restablecer la contraseña.",
      },
      { status: 202 }
    );
  } catch (error) {
    return toProblemResponse(error, INSTANCE);
  }
}
