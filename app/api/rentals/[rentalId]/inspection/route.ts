import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaCopyRepository } from "@/repositories/copy.repository.prisma";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { recordInspection } from "@/use-cases/rentals/delivery-and-return";

const InspectionSchema = z.object({
  result: z.enum(["OK", "INCOMPLETE", "DAMAGED"]),
  checklist: z.record(z.string(), z.unknown()).nullish(),
});

/**
 * Registro de la inspección de una devolución, por el operador.
 *
 * Deja constancia del resultado; **mover la copia** al estado que corresponda
 * (higienización o incompleta) es una transición aparte, para que el registro documental
 * y el cambio de estado se puedan auditar por separado.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ rentalId: string }> }
) {
  const { rentalId } = await params;
  try {
    const { user } = await requireSession();
    const data = await parseJsonBody(request, InspectionSchema);

    const report = await recordInspection(
      {
        rentals: prismaRentalRepository,
        copies: prismaCopyRepository,
        settings: prismaSettingsRepository,
      },
      {
        rentalId,
        actor: { id: user.id, role: user.role },
        result: data.result,
        checklist: data.checklist ?? null,
      }
    );

    return Response.json({ report }, { status: 201 });
  } catch (error) {
    return toProblemResponse(error, `/api/rentals/${rentalId}/inspection`);
  }
}
