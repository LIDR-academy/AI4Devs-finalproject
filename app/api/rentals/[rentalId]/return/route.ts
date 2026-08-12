import { requireSession } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaCopyRepository } from "@/repositories/copy.repository.prisma";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { startReturn } from "@/use-cases/rentals/delivery-and-return";

/**
 * El suscriptor inicia la devolución: la copia pasa a `EN_DEVOLUCION` y se genera el
 * registro de recogida (logística simulada, PRD §5).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ rentalId: string }> }
) {
  const { rentalId } = await params;
  try {
    const { user } = await requireSession();

    const rental = await startReturn(
      {
        rentals: prismaRentalRepository,
        copies: prismaCopyRepository,
        settings: prismaSettingsRepository,
      },
      { rentalId, actor: { id: user.id, role: user.role } }
    );

    return Response.json({ rental });
  } catch (error) {
    return toProblemResponse(error, `/api/rentals/${rentalId}/return`);
  }
}
