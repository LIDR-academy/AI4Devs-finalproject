import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaCopyRepository } from "@/repositories/copy.repository.prisma";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { emitter } from "@/use-cases/queue/deps";
import { reportDeliveryDiscrepancy } from "@/use-cases/rentals/delivery-and-return";

const DiscrepancySchema = z.object({
  notes: z.string().trim().min(5, "Cuéntanos brevemente qué no coincide.").max(1000),
});

/**
 * El suscriptor reporta que lo recibido no coincide con el registro de entrega.
 *
 * Abre una incidencia para el back-office **sin imputarle nada**: el registro previo
 * existe justamente para poder distinguir un daño anterior de uno causado durante el
 * alquiler.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ rentalId: string }> }
) {
  const { rentalId } = await params;
  try {
    const { user } = await requireSession();
    const { notes } = await parseJsonBody(request, DiscrepancySchema);

    const result = await reportDeliveryDiscrepancy(
      {
        rentals: prismaRentalRepository,
        copies: prismaCopyRepository,
        settings: prismaSettingsRepository,
        emit: emitter(),
      },
      { rentalId, actor: { id: user.id, role: user.role }, notes }
    );

    return Response.json(result, { status: 201 });
  } catch (error) {
    return toProblemResponse(error, `/api/rentals/${rentalId}/discrepancy`);
  }
}
