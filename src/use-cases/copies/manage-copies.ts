import { can } from "@/domain/auth/permissions";
import type { Role } from "@/domain/auth/roles";
import { ForbiddenError, NotFoundError } from "@/domain/errors";
import type { CopyRepository, CopySummary } from "@/repositories/copy.repository";
import type { SetRepository } from "@/repositories/set.repository";

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
