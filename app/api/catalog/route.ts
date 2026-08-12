import { toProblemResponse } from "@/http/problem";
import { prismaCatalogRepository } from "@/repositories/catalog.repository.prisma";
import { browsePublicCatalog } from "@/use-cases/catalog/browse-public-catalog";

const INSTANCE = "/api/catalog";

/**
 * Catálogo público. **No exige sesión** (D13): es la superficie que da
 * descubribilidad y conversión. Devuelve la proyección pública, sin disponibilidad ni
 * cola; esos datos llegan por los endpoints autenticados (tarea 3.6).
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const offset = url.searchParams.get("offset");

    const page = await browsePublicCatalog(
      { repository: prismaCatalogRepository },
      {
        // Un parámetro no numérico se ignora y se usa el valor por defecto: el caso de
        // uso ya satura el rango, así que no hay nada que validar aquí.
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      }
    );

    return Response.json(page);
  } catch (error) {
    return toProblemResponse(error, INSTANCE);
  }
}
