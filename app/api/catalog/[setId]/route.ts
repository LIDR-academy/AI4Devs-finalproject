import { toProblemResponse } from "@/http/problem";
import { prismaCatalogRepository } from "@/repositories/catalog.repository.prisma";
import { viewPublicSet } from "@/use-cases/catalog/browse-public-catalog";

/**
 * Detalle público de un Set. Sin sesión (D13) y sin disponibilidad ni cola: un Set no
 * publicado responde 404, igual que uno inexistente.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId } = await params;
  try {
    const set = await viewPublicSet({ repository: prismaCatalogRepository }, setId);
    return Response.json({ set });
  } catch (error) {
    return toProblemResponse(error, `/api/catalog/${setId}`);
  }
}
