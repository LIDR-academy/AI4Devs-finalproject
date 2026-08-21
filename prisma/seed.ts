import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { hashPassword } from "../src/domain/auth/password";
import { prisma } from "../src/db/prisma";

/**
 * Semilla de desarrollo (tarea 1.3).
 *
 * **Idempotente**: se puede ejecutar tantas veces como haga falta. Todo se crea con
 * `upsert` sobre una clave natural, o solo si aún no existe. No borra nada, así que
 * es seguro lanzarla sobre una base con datos.
 *
 * Catálogo: subconjunto curado del dataset público de Rebrickable
 * (`prisma/seed-data/sets.json`, ver el README de esa carpeta para la procedencia).
 */

const SEED_DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "seed-data");

/** Contraseña única para todas las cuentas semilla. Solo desarrollo. */
/**
 * Contraseña de las cuentas sembradas. `SEED_PASSWORD` la sustituye, y **hay que usarla
 * en cualquier despliegue accesible desde fuera**: el repositorio es público y
 * `readme.md` documenta la de desarrollo, así que sembrar una URL pública con el valor
 * por defecto equivale a publicar una cuenta de administrador abierta.
 */
const DEV_PASSWORD = process.env.SEED_PASSWORD || "clickoteca";

type SeedSet = {
  setNum: string;
  name: string;
  year: number;
  pieceCount: number;
  theme: string;
  parentTheme: string | null;
  boxPhotoUrl: string;
  recommendedAge: string;
  difficulty: string;
  referenceValue: number;
  restricted: boolean;
};

function loadSets(): SeedSet[] {
  return JSON.parse(readFileSync(join(SEED_DATA_DIR, "sets.json"), "utf8")) as SeedSet[];
}

function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuración: planes y parámetros del sistema
// ─────────────────────────────────────────────────────────────────────────────

/** Precios y límites de D9; el bono de cola es aditivo en días (D4/D11). */
async function seedPlans() {
  const plans = [
    { code: "BASIC", name: "Basic", monthlyPrice: "14.99", maxSimultaneousSets: 1, queueBonus: 0 },
    { code: "PREMIUM", name: "Premium", monthlyPrice: "24.99", maxSimultaneousSets: 2, queueBonus: 10 },
  ] as const;

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: { ...plan },
      create: { ...plan },
    });
  }
  return plans.length;
}

/**
 * Parámetros configurables por el admin (PRD §15.1). Se usa `create`-si-falta en vez
 * de `upsert` para **no pisar** un valor que el admin haya cambiado en la aplicación.
 */
async function seedSystemSettings() {
  const settings: Record<string, unknown> = {
    // D5 — ventana de confirmación de una oferta; el recordatorio sale a la mitad.
    offerConfirmationWindowHours: 48,
    // D5 — desplazamiento aplicado a quien deja caducar la oferta (vuelve al final).
    expiredOfferPenaltyDays: 7,
    // D7 — límite de colas simultáneas por usuario.
    maxQueuesPerUser: 1,
    // D7 — antigüedad mínima de suscripción para sets restringidos.
    restrictedSetMinMonths: 3,
    // D7 — cadencia por defecto de los recordatorios de retención.
    retentionReminderCadenceDays: 7,
  };

  let created = 0;
  for (const [key, value] of Object.entries(settings)) {
    const existing = await prisma.systemSetting.findUnique({ where: { key } });
    if (existing) continue;
    await prisma.systemSetting.create({ data: { key, value: value as never } });
    created++;
  }
  return created;
}

// ─────────────────────────────────────────────────────────────────────────────
// Catálogo: temas y sets
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Los temas de Rebrickable son jerárquicos (padre → hijo). `Theme` no tiene clave
 * única en el modelo, así que la deduplicación se hace por (nombre, padre).
 */
async function seedThemes(sets: SeedSet[]) {
  const cache = new Map<string, string>();

  async function ensure(name: string, parentId: string | null): Promise<string> {
    const cacheKey = `${parentId ?? "root"}::${name}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const existing = await prisma.theme.findFirst({ where: { name, parentId } });
    const theme = existing ?? (await prisma.theme.create({ data: { name, parentId } }));
    cache.set(cacheKey, theme.id);
    return theme.id;
  }

  const themeIdBySet = new Map<string, string>();
  for (const set of sets) {
    const parentId = set.parentTheme ? await ensure(set.parentTheme, null) : null;
    themeIdBySet.set(set.setNum, await ensure(set.theme, parentId));
  }
  return { themeIdBySet, total: cache.size };
}

async function seedSets(sets: SeedSet[], themeIdBySet: Map<string, string>) {
  for (const set of sets) {
    const data = {
      themeId: themeIdBySet.get(set.setNum)!,
      name: set.name,
      year: set.year,
      pieceCount: set.pieceCount,
      recommendedAge: set.recommendedAge,
      difficulty: set.difficulty,
      referenceValue: set.referenceValue.toFixed(2),
      boxPhotoUrl: set.boxPhotoUrl,
      restricted: set.restricted,
      published: true,
    };
    await prisma.set.upsert({
      where: { setNum: set.setNum },
      update: data,
      create: { setNum: set.setNum, ...data },
    });
  }
  return sets.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inventario: copias físicas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reparto determinista de copias, pensado para que el back-office tenga trabajo
 * visible desde el primer arranque.
 *
 * Solo se siembran los dos estados a los que se llega **por un camino legal** sin
 * inventar historia: `INTAKE`, que es el estado inicial, y `DISPONIBLE`, al que se
 * llega con la única transición que sale de él (PRD §15.5). Todos los demás
 * —`INCOMPLETA`, `BAJA`, `EN_INSPECCION`…— exigen haber pasado por un alquiler, así
 * que sembrarlos dejaría copias cuyo historial de transiciones sería imposible.
 * Aparecen al ejercitar el circuito.
 *
 * Las copias en `INTAKE` son trabajo real para el operador: están pendientes de
 * catalogar (tarea 3.3).
 */
function planCopies(index: number): Array<"INTAKE" | "DISPONIBLE"> {
  if (index % 7 === 0) return ["DISPONIBLE", "DISPONIBLE", "INTAKE"]; // set muy solicitado
  if (index % 5 === 0) return ["DISPONIBLE", "INTAKE"]; // una recién llegada
  if (index % 3 === 0) return ["DISPONIBLE", "DISPONIBLE"];
  return ["DISPONIBLE"];
}

async function seedCopies(operatorId: string) {
  const sets = await prisma.set.findMany({
    where: { setNum: { not: null } },
    orderBy: { setNum: "asc" },
    select: { id: true, _count: { select: { copies: true } } },
  });

  let created = 0;
  for (const [index, set] of sets.entries()) {
    if (set._count.copies > 0) continue; // ya sembrado

    for (const state of planCopies(index)) {
      const copy = await prisma.copy.create({ data: { setId: set.id, state } });
      created++;

      // Toda copia entra por INTAKE. Las que nacen ya catalogadas dejan registrada su
      // transición INTAKE → DISPONIBLE, que es la única que sale del estado inicial:
      // así el historial de auditoría (PRD §7) es coherente desde el arranque y no
      // contiene ningún salto que la máquina de estados prohibiría.
      if (state !== "INTAKE") {
        await prisma.copyStateTransition.create({
          data: {
            copyId: copy.id,
            actorId: operatorId,
            fromState: "INTAKE",
            toState: state,
            reason: "Alta de inventario (semilla de desarrollo)",
          },
        });
      }
    }
  }
  return created;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cuentas: un usuario por rol + suscriptores con suscripción activa
// ─────────────────────────────────────────────────────────────────────────────

type SeedUser = {
  email: string;
  fullName: string;
  role: "ADMIN" | "OPERATOR" | "SUBSCRIBER";
  address?: { line1: string; city: string; postalCode: string };
  /** Antigüedad de la suscripción, para ejercitar la regla de sets restringidos (D7). */
  subscription?: {
    plan: "BASIC" | "PREMIUM";
    startedMonthsAgo: number;
    /** Por defecto `ACTIVE`; `CANCELLED` sirve para ejercitar el rechazo sin plan. */
    status?: "ACTIVE" | "CANCELLED";
  };
};

const USERS: SeedUser[] = [
  { email: "admin@clickoteca.test", fullName: "Admin Clickoteca", role: "ADMIN" },
  { email: "operador@clickoteca.test", fullName: "Olga Operadora", role: "OPERATOR" },
  {
    email: "ana@example.test",
    fullName: "Ana Ruiz",
    role: "SUBSCRIBER",
    address: { line1: "Carrer de Mallorca 123, 2n 1a", city: "Barcelona", postalCode: "08036" },
    // Veterana: supera la antigüedad mínima, puede alquilar sets restringidos.
    subscription: { plan: "PREMIUM", startedMonthsAgo: 8 },
  },
  {
    email: "bruno@example.test",
    fullName: "Bruno Díaz",
    role: "SUBSCRIBER",
    address: { line1: "Calle Mayor 5, 3ºB", city: "Madrid", postalCode: "28013" },
    // Recién suscrito: NO llega a la antigüedad mínima (restrictedSetMinMonths).
    subscription: { plan: "BASIC", startedMonthsAgo: 1 },
  },
  {
    email: "carla@example.test",
    fullName: "Carla Nieto",
    role: "SUBSCRIBER",
    address: { line1: "Avenida del Puerto 44", city: "Valencia", postalCode: "46023" },
    // Se dio de baja. Desde que el plan es obligatorio en el alta no existe la "cuenta
    // de suscriptor sin suscripción", así que quien no tiene plan activo es alguien
    // que lo canceló: es el fixture del rechazo `NO_ACTIVE_SUBSCRIPTION` al solicitar
    // un set. Sembrarla sin ninguna fila de suscripción contradiría la propia spec.
    subscription: { plan: "BASIC", startedMonthsAgo: 6, status: "CANCELLED" },
  },
];

async function seedUsers() {
  const passwordHash = await hashPassword(DEV_PASSWORD);
  const ids = new Map<string, string>();

  for (const seed of USERS) {
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: { fullName: seed.fullName, role: seed.role },
      create: {
        email: seed.email,
        passwordHash,
        fullName: seed.fullName,
        role: seed.role,
        isAdult: true,
      },
    });
    ids.set(seed.email, user.id);

    if (seed.address) {
      const existing = await prisma.address.findFirst({ where: { userId: user.id } });
      if (!existing) {
        await prisma.address.create({
          data: { userId: user.id, ...seed.address, isDefault: true },
        });
      }
    }

    if (seed.role === "SUBSCRIBER") {
      const existing = await prisma.paymentMethod.findFirst({ where: { userId: user.id } });
      if (!existing) {
        await prisma.paymentMethod.create({
          data: {
            userId: user.id,
            brand: "VISA",
            last4: "4242", // tarjeta simulada (PRD §5): no hay pasarela real
            expMonth: 12,
            expYear: new Date().getFullYear() + 3,
            isDefault: true,
          },
        });
      }
    }

    if (seed.subscription) {
      // Cualquier suscripción, no solo las activas: una cancelada también es la
      // suscripción de esa cuenta, y volver a crearla en cada pasada duplicaría filas.
      const existing = await prisma.subscription.findFirst({ where: { userId: user.id } });
      if (!existing) {
        const plan = await prisma.plan.findUniqueOrThrow({
          where: { code: seed.subscription.plan },
        });
        const status = seed.subscription.status ?? "ACTIVE";
        const startedAt = monthsAgo(seed.subscription.startedMonthsAgo);
        await prisma.subscription.create({
          data: {
            userId: user.id,
            planId: plan.id,
            status,
            startedAt,
            cancelledAt: status === "CANCELLED" ? monthsAgo(1) : null,
          },
        });
      }
    }
  }
  return ids;
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const sets = loadSets();

  const plans = await seedPlans();
  const settings = await seedSystemSettings();
  const userIds = await seedUsers();
  const { themeIdBySet, total: themes } = await seedThemes(sets);
  const seededSets = await seedSets(sets, themeIdBySet);
  const copies = await seedCopies(userIds.get("operador@clickoteca.test")!);

  console.log("[seed] Completado:");
  console.log(`  planes            ${plans}`);
  console.log(`  ajustes nuevos    ${settings}`);
  // La de desarrollo se imprime porque es pública y ahorra ir a buscarla; una puesta a
  // mano, no: acabaría en el historial de la terminal y en cualquier log de CI.
  const comoEsLaClave = process.env.SEED_PASSWORD ? "la de SEED_PASSWORD" : `"${DEV_PASSWORD}"`;
  console.log(`  usuarios          ${userIds.size} (contraseña: ${comoEsLaClave})`);
  console.log(`  temas             ${themes}`);
  console.log(`  sets              ${seededSets}`);
  console.log(`  copias nuevas     ${copies}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
