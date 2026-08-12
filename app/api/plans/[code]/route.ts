import { z } from "zod";

import { NotFoundError } from "@/domain/errors";
import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";
import { updatePlanConfig } from "@/use-cases/subscriptions/manage-subscription";

const UpdatePlanSchema = z
  .object({
    monthlyPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Usa un importe como 14.99.").optional(),
    // Los mensajes van explícitos: los de Zod salen en inglés y acabarían llegando
    // tal cual al usuario dentro de `errors[]`.
    maxSimultaneousSets: z
      .number()
      .int("Debe ser un número entero.")
      .min(1, "El plan debe permitir al menos un set.")
      .max(10, "Como máximo 10 sets simultáneos.")
      .optional(),
    queueBonusDays: z
      .number()
      .int("Debe ser un número entero.")
      .min(0, "El bono no puede ser negativo.")
      .max(365, "Como máximo 365 días de bono.")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No has enviado ningún campo que actualizar.",
  });

const CodeSchema = z.enum(["BASIC", "PREMIUM"]);

/** Configura precio, límite de sets y bono de cola de un plan — solo admin (D9). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const instance = `/api/plans/${code}`;
  try {
    const { user } = await requireSession();

    // Un plan inexistente es un 404, no un 422: lo que no existe es el recurso de la
    // URL, no un campo del cuerpo.
    const parsedCode = CodeSchema.safeParse(code.toUpperCase());
    if (!parsedCode.success) throw new NotFoundError("El plan no existe.");

    const data = await parseJsonBody(request, UpdatePlanSchema);

    const plan = await updatePlanConfig(
      { subscriptions: prismaSubscriptionRepository, audit: prismaAuditRepository },
      { code: parsedCode.data, actor: { id: user.id, role: user.role }, ...data }
    );

    return Response.json({ plan });
  } catch (error) {
    return toProblemResponse(error, instance);
  }
}
