import { currentSession } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaCatalogRepository } from "@/repositories/catalog.repository.prisma";
import { viewPublicSet, viewSetAsSubscriber } from "@/use-cases/catalog/browse-public-catalog";

/**
 * Detalle de un Set. **Un endpoint, dos proyecciones** (spec `catalog-inventory`):
 * sin sesión devuelve los atributos de catálogo; con sesión añade disponibilidad y
 * situación en la cola.
 *
 * Se resuelve así, y no con dos URLs, porque es el mismo recurso: lo que cambia es
 * cuánto de él puede ver quien pregunta.
 *
 * Un Set no publicado responde 404 en ambos casos.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId } = await params;
  try {
    const deps = { repository: prismaCatalogRepository };
    const session = await currentSession();

    const set = session
      ? await viewSetAsSubscriber(deps, { setId, userId: session.user.id })
      : await viewPublicSet(deps, setId);

    return Response.json({ set, projection: session ? "authenticated" : "public" });
  } catch (error) {
    return toProblemResponse(error, `/api/catalog/${setId}`);
  }
}
