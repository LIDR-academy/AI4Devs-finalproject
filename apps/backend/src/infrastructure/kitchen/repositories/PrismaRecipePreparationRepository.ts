import { PrismaClient, Prisma } from '../../../generated/prisma/client.js';
import { IRecipePreparationRepository } from '../../../domain/kitchen/repositories/IRecipePreparationRepository.js';
import {
  RecipePreparation,
  RecipePreparationStatus,
} from '../../../domain/kitchen/entities/RecipePreparation.js';

type RawPreparation = Prisma.RecipePreparationGetPayload<Record<string, never>>;

function toRecipePreparation(raw: RawPreparation): RecipePreparation {
  return new RecipePreparation({
    id: raw.id,
    recipeId: raw.recipeId,
    plannedPortions: raw.plannedPortions,
    status: raw.status as RecipePreparationStatus,
    openedByOperatorId: raw.openedByOperatorId ?? undefined,
    openedAt: raw.openedAt,
    actualPortions: raw.actualPortions ?? undefined,
    closedByOperatorId: raw.closedByOperatorId ?? undefined,
    closedAt: raw.closedAt ?? undefined,
    notes: raw.notes ?? undefined,
  });
}

export function recipePreparationUpsertArgs(p: RecipePreparation) {
  const data = {
    recipeId: p.recipeId,
    plannedPortions: p.plannedPortions,
    status: p.status,
    openedByOperatorId: p.openedByOperatorId ?? null,
    openedAt: p.openedAt,
    actualPortions: p.actualPortions ?? null,
    closedByOperatorId: p.closedByOperatorId ?? null,
    closedAt: p.closedAt ?? null,
    notes: p.notes ?? null,
  };
  return { where: { id: p.id }, update: data, create: { id: p.id, ...data } };
}

export class PrismaRecipePreparationRepository implements IRecipePreparationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(preparation: RecipePreparation): Promise<void> {
    await this.prisma.recipePreparation.upsert(recipePreparationUpsertArgs(preparation));
  }

  async findById(id: string): Promise<RecipePreparation | null> {
    const raw = await this.prisma.recipePreparation.findUnique({ where: { id } });
    return raw ? toRecipePreparation(raw) : null;
  }

  async findByStatus(status: RecipePreparationStatus): Promise<RecipePreparation[]> {
    const list = await this.prisma.recipePreparation.findMany({
      where: { status },
      orderBy: { openedAt: 'asc' },
    });
    return list.map(toRecipePreparation);
  }
}
