import { prisma } from "@/db/prisma";
import type { PublicSet } from "@/domain/catalog/public-projection";
import type { CatalogRepository, PublicPlan } from "@/repositories/catalog.repository";

/** Adaptador Prisma del puerto `CatalogRepository`. */

/**
 * Selección explícita: la proyección pública se define **en la consulta**. Con un
 * `select` cerrado, un campo interno (`referenceValue`, `published`) no llega
 * siquiera a salir de la base, así que no puede escaparse más arriba por descuido.
 */
const PUBLIC_SET_SELECT = {
  id: true,
  setNum: true,
  name: true,
  year: true,
  pieceCount: true,
  recommendedAge: true,
  difficulty: true,
  boxPhotoUrl: true,
  theme: { select: { name: true } },
} as const;

type PublicSetRow = {
  id: string;
  setNum: string | null;
  name: string;
  year: number | null;
  pieceCount: number;
  recommendedAge: string | null;
  difficulty: string | null;
  boxPhotoUrl: string | null;
  theme: { name: string };
};

function toPublicSet(row: PublicSetRow): PublicSet {
  const { theme, ...rest } = row;
  return { ...rest, theme: theme.name };
}

/** Solo los Sets publicados existen para el visitante. */
const PUBLISHED = { published: true } as const;

export const prismaCatalogRepository: CatalogRepository = {
  async listPublicSets({ limit = 24, offset = 0 } = {}) {
    const [rows, total] = await Promise.all([
      prisma.set.findMany({
        where: PUBLISHED,
        select: PUBLIC_SET_SELECT,
        orderBy: [{ name: "asc" }],
        take: limit,
        skip: offset,
      }),
      prisma.set.count({ where: PUBLISHED }),
    ]);

    return { sets: rows.map(toPublicSet), total };
  },

  async findPublicSetById(id) {
    const row = await prisma.set.findFirst({
      // `findFirst` con el filtro de publicado, no `findUnique` por id: un Set sin
      // publicar debe ser indistinguible de uno inexistente para el visitante.
      where: { id, ...PUBLISHED },
      select: PUBLIC_SET_SELECT,
    });
    return row ? toPublicSet(row) : null;
  },

  async findAuthenticatedSetById({ setId, userId }) {
    const row = await prisma.set.findFirst({
      where: { id: setId, ...PUBLISHED },
      select: { ...PUBLIC_SET_SELECT, restricted: true },
    });
    if (!row) return null;

    const { restricted, ...publicPart } = row;

    // La cola se lee ordenada por entrada efectiva (D11) y se busca la posición del
    // usuario en memoria: son unas pocas filas por set y así el orden es exactamente
    // el mismo que usa el motor de ofertas, sin duplicar el criterio en SQL.
    const [availableCopies, totalCopies, queue] = await Promise.all([
      prisma.copy.count({ where: { setId, state: "DISPONIBLE" } }),
      prisma.copy.count({ where: { setId, state: { not: "BAJA" } } }),
      prisma.reservationQueueEntry.findMany({
        where: { setId, status: { in: ["WAITING", "OFFERED"] } },
        select: { userId: true },
        orderBy: [{ effectiveEntryAt: "asc" }, { id: "asc" }],
      }),
    ]);

    const index = queue.findIndex((entry) => entry.userId === userId);

    return {
      ...toPublicSet(publicPart),
      availableCopies,
      totalCopies,
      queueLength: queue.length,
      queuePosition: index === -1 ? null : index + 1,
      restricted,
    };
  },

  async listPublicPlans() {
    const rows = await prisma.plan.findMany({
      where: { active: true },
      select: {
        code: true,
        name: true,
        monthlyPrice: true,
        maxSimultaneousSets: true,
        queueBonus: true,
      },
      orderBy: { monthlyPrice: "asc" },
    });

    return rows.map(
      (row): PublicPlan => ({
        code: row.code,
        name: row.name,
        // `toFixed(2)` y no `toString()`: este último daría "15" para 15.00.
        monthlyPrice: row.monthlyPrice.toFixed(2),
        maxSimultaneousSets: row.maxSimultaneousSets,
        queueBonusDays: row.queueBonus,
      })
    );
  },
};
