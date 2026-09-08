import { can } from "@/domain/auth/permissions";
import type { Role } from "@/domain/auth/roles";
import { assertPublishable } from "@/domain/catalog/set-rules";
import { ForbiddenError, NotFoundError, ValidationError } from "@/domain/errors";
import type { AuditRepository } from "@/repositories/audit.repository";
import type {
  CreateSetInput,
  ManagedSet,
  ManagedSetsPage,
  SetRepository,
  ThemeOption,
  UpdateSetInput,
} from "@/repositories/set.repository";

export interface ManageSetsDeps {
  repository: SetRepository;
  audit: AuditRepository;
  now?: () => Date;
}

export interface Actor {
  id: string;
  role: Role;
}

/**
 * Sets por página en la lista del back-office. Es un número de pantalla, no de API:
 * la tabla cabe de un vistazo y la paginación evita traerse el catálogo entero.
 */
export const CATALOG_PAGE_SIZE = 25;

export interface BrowseManagedCatalogInput {
  actor: Actor;
  search?: string | null;
  /** `null` = todos, **incluidos los no publicados**: es el defecto de la pantalla. */
  published?: boolean | null;
  /** Página pedida, 1-indexada. Se satura al rango válido en vez de rechazarse. */
  page?: number;
}

export interface ManagedCatalogPage extends ManagedSetsPage {
  page: number;
  pageCount: number;
  pageSize: number;
}

/**
 * Catálogo completo para el back-office (`wireframes.md` §2.1 y §6.1).
 *
 * Incluye los **no publicados**, y esa es la razón de que la pantalla exista: un set
 * recién creado nace sin publicar y el catálogo público lo devuelve como 404, así que
 * sin esta lista no habría forma de volver a él.
 *
 * La página se **satura** igual que en el catálogo público: pedir la 99 de 2 devuelve
 * la última, no un error. Un número de página fuera de rango es un enlace viejo, no
 * una petición malintencionada.
 */
export async function browseManagedCatalog(
  { repository }: ManageSetsDeps,
  input: BrowseManagedCatalogInput
): Promise<ManagedCatalogPage> {
  requirePermission(input.actor, "set.manage");

  const filter = {
    search: input.search ?? null,
    published: input.published ?? null,
    limit: CATALOG_PAGE_SIZE,
  };

  const asked = Math.max(1, Number.isFinite(input.page) ? Math.trunc(input.page ?? 1) : 1);
  const first = await repository.listManaged({ ...filter, offset: (asked - 1) * CATALOG_PAGE_SIZE });
  const pageCount = Math.max(1, Math.ceil(first.totalSets / CATALOG_PAGE_SIZE));

  // Solo se vuelve a consultar si la página pedida no existe —un enlace viejo, o el
  // filtro que acaba de encoger la lista—; en el caso normal esto es una consulta.
  if (asked <= pageCount) {
    return { ...first, page: asked, pageCount, pageSize: CATALOG_PAGE_SIZE };
  }

  const last = await repository.listManaged({
    ...filter,
    offset: (pageCount - 1) * CATALOG_PAGE_SIZE,
  });
  return { ...last, page: pageCount, pageCount, pageSize: CATALOG_PAGE_SIZE };
}

/** Temas disponibles para el alta y la edición de un Set (§6.3). */
export async function listThemeOptions(
  { repository }: ManageSetsDeps,
  actor: Actor
): Promise<readonly ThemeOption[]> {
  requirePermission(actor, "set.manage");
  return repository.listThemes();
}

/** Alta de un Set en el catálogo. Nace **sin publicar**: publicar es un acto aparte. */
export async function createSet(
  { repository }: ManageSetsDeps,
  input: CreateSetInput & { actor: Actor }
): Promise<ManagedSet> {
  requirePermission(input.actor, "set.manage");

  if (!(await repository.themeExists(input.themeId))) {
    throw new ValidationError([{ field: "themeId", issue: "El tema no existe." }]);
  }

  const { actor: _actor, ...data } = input;
  return repository.create(data);
}

export async function updateSet(
  { repository }: ManageSetsDeps,
  setId: string,
  input: UpdateSetInput & { actor: Actor }
): Promise<ManagedSet> {
  requirePermission(input.actor, "set.manage");

  if (input.themeId !== undefined && !(await repository.themeExists(input.themeId))) {
    throw new ValidationError([{ field: "themeId", issue: "El tema no existe." }]);
  }

  const { actor: _actor, ...data } = input;
  const updated = await repository.update(setId, data);
  if (!updated) throw new NotFoundError("El set no existe.");
  return updated;
}

/**
 * Publica un Set. Solo admin (`set.publish`) y solo si está tasado: la regla de
 * `assertPublishable` se comprueba sobre el Set **ya guardado**, no sobre lo que venga
 * en la petición, porque lo que importa es el estado real del catálogo.
 */
export async function publishSet(
  deps: ManageSetsDeps,
  setId: string,
  actor: Actor
): Promise<ManagedSet> {
  return changePublication(deps, setId, actor, true);
}

export async function unpublishSet(
  deps: ManageSetsDeps,
  setId: string,
  actor: Actor
): Promise<ManagedSet> {
  return changePublication(deps, setId, actor, false);
}

async function changePublication(
  { repository, audit, now = () => new Date() }: ManageSetsDeps,
  setId: string,
  actor: Actor,
  published: boolean
): Promise<ManagedSet> {
  requirePermission(actor, "set.publish");

  const set = await repository.findById(setId);
  if (!set) throw new NotFoundError("El set no existe.");

  if (published) assertPublishable(set);

  // Retirar del catálogo algo ya publicado, o publicarlo de nuevo, es idempotente: si
  // ya está en el estado pedido no se toca nada ni se ensucia la auditoría.
  if (set.published === published) return set;

  const updated = await repository.setPublished(setId, published);
  if (!updated) throw new NotFoundError("El set no existe.");

  await audit.record({
    actorId: actor.id,
    action: published ? "set.published" : "set.unpublished",
    entityType: "Set",
    entityId: setId,
    metadata: { name: set.name, referenceValue: set.referenceValue },
    at: now(),
  });

  return updated;
}

function requirePermission(actor: Actor, permission: "set.manage" | "set.publish"): void {
  if (can(actor.role, permission)) return;
  throw new ForbiddenError(
    permission === "set.publish"
      ? "Solo un administrador puede publicar o retirar sets del catálogo."
      : "Tu rol no permite gestionar el catálogo."
  );
}
