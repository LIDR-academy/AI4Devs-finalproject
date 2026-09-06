import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaCopyRepository } from "@/repositories/copy.repository.prisma";
import { retireCopy } from "@/use-cases/copies/retire-copy";

const RetireSchema = z.object({
  // Obligatoria, a diferencia del endpoint genérico de transiciones: la baja tiene
  // impacto económico y su motivo es parte del rastro de auditoría, no un adorno.
  reason: z.string().trim().min(3, "Indica el motivo de la baja."),
});

/**
 * Da de baja una copia — solo admin (HU-15).
 *
 * Es la transición a `BAJA` de la máquina de estados, con endpoint propio por su
 * semántica: exige motivo y solo se puede llegar desde `EN_INSPECCION`, `INCOMPLETA` o
 * `ALQUILADA` (PRD §15.5). La lógica vive en `transitionCopy`, no duplicada aquí.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ copyId: string }> }
) {
  const { copyId } = await params;
  try {
    const { user } = await requireSession();
    const { reason } = await parseJsonBody(request, RetireSchema);

    const result = await retireCopy(
      { repository: prismaCopyRepository },
      { copyId, actor: { id: user.id, role: user.role }, reason }
    );

    return Response.json({ copyId: result.copyId, from: result.fromState, state: "BAJA" });
  } catch (error) {
    return toProblemResponse(error, `/api/copies/${copyId}/retire`);
  }
}
