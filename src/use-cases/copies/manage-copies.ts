import { can } from "@/domain/auth/permissions";
import type { Role } from "@/domain/auth/roles";
import { ForbiddenError, NotFoundError } from "@/domain/errors";
import type { CopyRepository, CopySummary, InventoryCopy } from "@/repositories/copy.repository";
import type { ManagedSet, SetRepository } from "@/repositories/set.repository";

export interface ManageCopiesDeps {
  copies: CopyRepository;
  sets: SetRepository;
  now?: () => Date;
}

export interface Actor {
  id: string;
  role: Role;
}

/**
 * Da de alta una copia física de un Set. Nace en `INTAKE` (PRD §15.5): catalogarla y
 * ponerla en circulación es la transición siguiente, que hace el operador aparte.
 *
 * Un Set puede tener tantas copias como haga falta — es justo el motivo de separar
 * Set de Copia (D1): tener dos ejemplares de un set popular no exige ningún refactor.
 */
export async function addCopy(
  { copies, sets, now = () => new Date() }: ManageCopiesDeps,
  input: { setId: string; actor: Actor }
): Promise<CopySummary> {
  if (!can(input.actor.role, "copy.create")) {
    throw new ForbiddenError("Tu rol no permite dar de alta copias.");
  }

  const set = await sets.findById(input.setId);
  if (!set) throw new NotFoundError("El set no existe.");

  return copies.create({ setId: input.setId, acquiredAt: now() });
}

/** Copias de un Set con su estado. Vista de back-office, no pública. */
export async function listCopiesOfSet(
  { copies, sets }: ManageCopiesDeps,
  input: { setId: string; actor: Actor }
): Promise<readonly CopySummary[]> {
  if (!can(input.actor.role, "backoffice.access")) {
    throw new ForbiddenError("Tu rol no permite consultar el inventario.");
  }

  const set = await sets.findById(input.setId);
  if (!set) throw new NotFoundError("El set no existe.");

  return copies.listBySet(input.setId);
}

export interface SetInventory {
  set: ManagedSet;
  copies: readonly InventoryCopy[];
}

/**
 * Ficha de inventario de un Set para el back-office (`wireframes.md` §6.2): el set
 * con sus datos completos —los de gestión, no la proyección pública— y todas sus
 * copias con quién tiene cada una.
 *
 * Pide `set.manage` y no `backoffice.access` porque es la pantalla de la sección
 * Catálogo, y quien no puede gestionar el catálogo no ve ni el destino en la barra:
 * dar acceso a la ficha por una puerta distinta que a la lista sería incoherente.
 */
export async function loadSetInventory(
  { copies, sets }: ManageCopiesDeps,
  input: { setId: string; actor: Actor }
): Promise<SetInventory> {
  if (!can(input.actor.role, "set.manage")) {
    throw new ForbiddenError("Tu rol no permite consultar el catálogo.");
  }

  const set = await sets.findById(input.setId);
  if (!set) throw new NotFoundError("El set no existe.");

  return { set, copies: await copies.listInventoryBySet(input.setId) };
}
