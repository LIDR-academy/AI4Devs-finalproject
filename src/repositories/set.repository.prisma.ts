import { prisma } from "@/db/prisma";
import type {
  CreateSetInput,
  ManagedSet,
  SetRepository,
  UpdateSetInput,
} from "@/repositories/set.repository";

/** Adaptador Prisma del puerto `SetRepository`. */

const MANAGED_SELECT = {
  id: true,
  setNum: true,
  themeId: true,
  name: true,
  year: true,
  pieceCount: true,
  recommendedAge: true,
  difficulty: true,
  referenceValue: true,
  boxPhotoUrl: true,
  restricted: true,
  published: true,
} as const;

type ManagedRow = Omit<ManagedSet, "referenceValue"> & {
  referenceValue: { toFixed(dp: number): string } | null;
};

/**
 * El decimal viaja como cadena: en coma flotante binaria, 14.99 deja de ser 14.99.
 * Con `toFixed(2)` y no `toString()`, porque este último devolvería `"99.9"` para
 * 99.90 — numéricamente igual, pero un importe se muestra con sus dos decimales.
 */
function toManagedSet(row: ManagedRow): ManagedSet {
  return { ...row, referenceValue: row.referenceValue?.toFixed(2) ?? null };
}

/** Traduce el input de dominio a `data` de Prisma, omitiendo lo no enviado. */
function toData(input: UpdateSetInput) {
  const data: Record<string, unknown> = {};
  for (const key of [
    "themeId",
    "name",
    "pieceCount",
    "setNum",
    "year",
    "recommendedAge",
    "difficulty",
    "boxPhotoUrl",
    "restricted",
  ] as const) {
    if (input[key] !== undefined) data[key] = input[key];
  }
  // `referenceValue` se trata aparte: `null` es un valor legítimo (des-tasar un set),
  // así que no puede confundirse con "no enviado".
  if (input.referenceValue !== undefined) data.referenceValue = input.referenceValue;
  return data;
}

export const prismaSetRepository: SetRepository = {
  async findById(setId) {
    const row = await prisma.set.findUnique({ where: { id: setId }, select: MANAGED_SELECT });
    return row ? toManagedSet(row as ManagedRow) : null;
  },

  async create(input: CreateSetInput) {
    const row = await prisma.set.create({
      data: { ...toData(input), themeId: input.themeId } as never,
      select: MANAGED_SELECT,
    });
    return toManagedSet(row as ManagedRow);
  },

  async update(setId, input) {
    const { count } = await prisma.set.updateMany({
      where: { id: setId },
      data: toData(input) as never,
    });
    if (count === 0) return null;
    return this.findById(setId);
  },

  async setPublished(setId, published) {
    const { count } = await prisma.set.updateMany({ where: { id: setId }, data: { published } });
    if (count === 0) return null;
    return this.findById(setId);
  },

  async themeExists(themeId) {
    return (await prisma.theme.count({ where: { id: themeId } })) > 0;
  },
};
