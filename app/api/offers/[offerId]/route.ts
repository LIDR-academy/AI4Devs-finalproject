import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { offerDeps } from "@/use-cases/queue/deps";
import { acceptOffer, rejectOffer } from "@/use-cases/queue/respond-to-offer";

const ResponseSchema = z.object({
  response: z.enum(["ACCEPT", "REJECT"]),
});

/**
 * Responde a una oferta de cola dentro de su ventana de confirmación (D5).
 *
 * Un único endpoint con la respuesta en el cuerpo, en vez de `/accept` y `/reject`:
 * son dos respuestas a la misma pregunta y así el cliente no puede confundirse de URL.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ offerId: string }> }
) {
  const { offerId } = await params;
  try {
    const { user } = await requireSession();
    const { response } = await parseJsonBody(request, ResponseSchema);

    if (response === "REJECT") {
      await rejectOffer(offerDeps(), { userId: user.id, offerId });
      return new Response(null, { status: 204 });
    }

    const result = await acceptOffer(offerDeps(), { userId: user.id, offerId });
    return Response.json(result, { status: 201 });
  } catch (error) {
    return toProblemResponse(error, `/api/offers/${offerId}`);
  }
}
