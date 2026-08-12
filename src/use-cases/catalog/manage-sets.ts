import { can } from "@/domain/auth/permissions";
import type { Role } from "@/domain/auth/roles";
import { assertPublishable } from "@/domain/catalog/set-rules";
import { ForbiddenError, NotFoundError, ValidationError } from "@/domain/errors";
import type { AuditRepository } from "@/repositories/audit.repository";
import type {
  CreateSetInput,
  ManagedSet,
  SetRepository,
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
