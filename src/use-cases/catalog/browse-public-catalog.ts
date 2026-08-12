import type { AuthenticatedSet, PublicSet } from "@/domain/catalog/public-projection";
import { NotFoundError } from "@/domain/errors";
import type { CatalogRepository, PublicPlan } from "@/repositories/catalog.repository";

export interface CatalogDeps {
  repository: CatalogRepository;
}

/** Tope de página: evita que una petición pida el catálogo entero de una vez. */
export const MAX_PAGE_SIZE = 48;
const DEFAULT_PAGE_SIZE = 24;

export interface BrowsePublicCatalogInput {
  limit?: number;
  offset?: number;
}

export interface PublicCatalogPage {
  sets: readonly PublicSet[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Catálogo público: lo que ve un visitante sin sesión (D13).
 *
 * Los parámetros de paginación se **saturan** en vez de rechazarse: un `limit=1000`
 * es una petición razonable mal calibrada, no un error del que haya que informar, y
 * devolver 48 resultados es mejor respuesta que un 422.
 */
export async function browsePublicCatalog(
  { repository }: CatalogDeps,
  input: BrowsePublicCatalogInput = {}
): Promise<PublicCatalogPage> {
  const limit = clamp(input.limit ?? DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const offset = Math.max(0, Math.trunc(input.offset ?? 0));

  const { sets, total } = await repository.listPublicSets({ limit, offset });
  return { sets, total, limit, offset };
}

/**
 * Detalle público de un Set. Un Set sin publicar responde igual que uno inexistente:
 * distinguirlos permitiría sondear qué hay en el catálogo antes de publicarlo.
 */
export async function viewPublicSet(
  { repository }: CatalogDeps,
  id: string
): Promise<PublicSet> {
  const set = await repository.findPublicSetById(id);
  if (!set) throw new NotFoundError("El set no existe o no está publicado.");
  return set;
}

/**
 * Detalle de un Set para quien tiene sesión: lo público **más** disponibilidad y cola.
 *
 * Un mismo Set, dos proyecciones, y la elección entre ellas la hace el llamante según
 * haya sesión o no. Devolver una u otra desde el mismo caso de uso con un `if` interno
 * sería mucho más fácil de equivocar.
 */
export async function viewSetAsSubscriber(
  { repository }: CatalogDeps,
  input: { setId: string; userId: string }
): Promise<AuthenticatedSet> {
  const set = await repository.findAuthenticatedSetById(input);
  if (!set) throw new NotFoundError("El set no existe o no está publicado.");
  return set;
}

/** Planes de membresía y sus condiciones, visibles sin sesión. */
export async function listMembershipPlans({
  repository,
}: CatalogDeps): Promise<readonly PublicPlan[]> {
  return repository.listPublicPlans();
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}
