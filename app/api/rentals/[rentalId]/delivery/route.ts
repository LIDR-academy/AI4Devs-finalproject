import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaCopyRepository } from "@/repositories/copy.repository.prisma";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import {
  getDeliveryStatus,
  recordDeliveryCondition,
} from "@/use-cases/rentals/delivery-and-return";

const DeliverySchema = z.object({
  result: z.enum(["OK", "INCOMPLETE", "DAMAGED"]),
  checklist: z.record(z.string(), z.unknown()).nullish(),
});

function deps() {
  return {
    rentals: prismaRentalRepository,
    copies: prismaCopyRepository,
    settings: prismaSettingsRepository,
  };
}

/** Situación de la confirmación de entrega: pendiente, tácita o discutida. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ rentalId: string }> }
) {
  const { rentalId } = await params;
  try {
    const { user } = await requireSession();
    const status = await getDeliveryStatus(deps(), {
      rentalId,
      actor: { id: user.id, role: user.role },
    });
    return Response.json(status);
  } catch (error) {
    return toProblemResponse(error, `/api/rentals/${rentalId}/delivery`);
  }
}

/** Registro de condición previo al envío, por el operador (D8). */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ rentalId: string }> }
) {
  const { rentalId } = await params;
  try {
    const { user } = await requireSession();
    const data = await parseJsonBody(request, DeliverySchema);

    const result = await recordDeliveryCondition(deps(), {
      rentalId,
      actor: { id: user.id, role: user.role },
      result: data.result,
      checklist: data.checklist ?? null,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    return toProblemResponse(error, `/api/rentals/${rentalId}/delivery`);
  }
}
