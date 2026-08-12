import { z } from "zod";

import { COPY_STATES } from "@/domain/copy/lifecycle";
import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaCopyRepository } from "@/repositories/copy.repository.prisma";
import { transitionCopy } from "@/use-cases/copies/transition-copy";

const TransitionSchema = z.object({
  to: z.enum(COPY_STATES),
  reason: z.string().trim().min(1).max(500).optional(),
});

/**
 * Mueve una copia por su ciclo de vida: el alta (`INTAKE → DISPONIBLE`), la recepción,
 * la inspección, la higienización y las ramas de incompleta y baja.
 *
 * Un solo endpoint para todas en vez de uno por transición: la tabla de PRD §15.5 ya
 * dice qué es válido y qué permiso hace falta, así que multiplicar rutas solo
 * multiplicaría los sitios donde olvidarse de comprobarlo.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ copyId: string }> }
) {
  const { copyId } = await params;
  try {
    const { user } = await requireSession();
    const { to, reason } = await parseJsonBody(request, TransitionSchema);

    const result = await transitionCopy(
      { repository: prismaCopyRepository },
      { copyId, toState: to, actor: { id: user.id, role: user.role }, reason }
    );

    return Response.json(result);
  } catch (error) {
    return toProblemResponse(error, `/api/copies/${copyId}/transitions`);
  }
}
