import { z } from "zod";

import { ValidationError } from "@/domain/errors";
import { requirePermission } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaCopyRepository } from "@/repositories/copy.repository.prisma";
import { retireCopy } from "@/use-cases/copies/retire-copy";

const RetireSchema = z.object({
  // Obligatoria: la baja tiene impacto económico y su motivo es parte del rastro de
  // auditoría, no un adorno. Sin motivo, el registro no explicaría nada.
  reason: z.string().trim().min(3, "Indica el motivo de la baja."),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ copyId: string }> }
) {
  const { copyId } = await params;
  const instance = `/api/copies/${copyId}/retire`;

  try {
    const session = await requirePermission("copy.retire");

    const raw: unknown = await request.json().catch(() => {
      throw new ValidationError(
        [{ field: "body", issue: "Se esperaba un cuerpo JSON." }],
        "Petición mal formada."
      );
    });

    const parsed = RetireSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => ({
          field: issue.path.join(".") || "body",
          issue: issue.message,
        }))
      );
    }

    const result = await retireCopy(
      { repository: prismaCopyRepository },
      {
        copyId,
        actor: { id: session.user.id, role: session.user.role },
        reason: parsed.data.reason,
      }
    );

    return Response.json({ copyId: result.copyId, from: result.fromState, state: "BAJA" });
  } catch (error) {
    return toProblemResponse(error, instance);
  }
}
