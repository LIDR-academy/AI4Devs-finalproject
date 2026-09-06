import { notificationsFor, type DomainEvent } from "../src/domain/notifications/events";
import { prisma } from "../src/db/prisma";
import { applyTransition, type Tx } from "../src/repositories/copy-transitions";

/**
 * Historial de operación de la semilla: alquileres, devoluciones e inspecciones ya
 * ocurridos, más lo que ahora mismo está en curso.
 *
 * **Por qué existe.** La semilla base deja el catálogo y las cuentas, pero la base
 * nace sin pasado: el portal enseña "aún no has alquilado nada", la cola de trabajo del
 * operador está vacía y el historial de una copia es una sola línea. Eso basta para
 * probar el circuito, y no basta para *revisar la aplicación*, que es un uso distinto:
 * quien entra a mirarla necesita ver el sistema a mitad de camino, no recién encendido.
 *
 * **Tres reglas que gobiernan todo lo de aquí.**
 *
 * 1. **Ningún estado se escribe a mano.** Cada cambio de una copia pasa por
 *    `applyTransition` —el mismo camino que usa la aplicación—, así que la tabla de
 *    transiciones de PRD §15.5 se respeta por construcción y el historial de auditoría
 *    de cualquier copia es un recorrido legal. Los avisos salen de `notificationsFor`,
 *    la misma función pura que usa el emisor real: no hay una segunda versión de "qué
 *    notifica cada evento" que pueda divergir.
 *
 * 2. **El historial trae sus propias copias.** Las 59 de la semilla base se quedan
 *    exactamente como están, y los alquileres de aquí corren sobre copias nuevas que
 *    este módulo da de alta con fecha pasada. No es un capricho: el E2E busca "un set
 *    con **una sola** copia libre" y "un set con **dos o más**", y un historial que
 *    consumiera inventario existente le movería el suelo. Por eso tampoco se añaden
 *    copias a los sets que solo tienen una.
 *
 * 3. **Todo cuadra en el tiempo.** Ningún alquiler empieza antes de la suscripción que
 *    lo paga, ninguna copia está en dos manos a la vez, y un set restringido solo lo
 *    alquila quien ya tenía la antigüedad exigida **en aquel momento**, no ahora.
 *
 * Es idempotente por el mismo criterio que el resto de la semilla: si los suscriptores
 * que este módulo introduce ya tienen alquileres, no hay nada que hacer.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Guion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hasta dónde llega un ciclo. Los cuatro primeros dejan trabajo vivo en el sistema, uno
 * por cada punto en que el circuito puede estar parado ahora mismo; `closed` es el ciclo
 * que ya terminó y devolvió la copia a circulación.
 */
type Stage =
  /** Adjudicada, sin preparar: es lo que espera en "Por preparar" (W2). */
  | "assigned"
  /** Enviada y en casa del suscriptor. */
  | "delivered"
  /** El suscriptor ya pulsó "Devolver"; falta que el operador la reciba. */
  | "returning"
  /** Recibida y sobre la mesa de inspección. */
  | "inspecting"
  | "closed";

interface CycleSpec {
  /** Días desde hoy hasta la adjudicación de la copia. */
  startDaysAgo: number;
  /** Días que el set pasa en casa del suscriptor antes de iniciar la devolución. */
  rentedDays: number;
  /** Resultado de la inspección. `DAMAGED` acaba en baja de la copia (solo admin). */
  outcome?: "OK" | "INCOMPLETE" | "DAMAGED";
  stopAt?: Stage;
  /**
   * El alquiler no nace de pedir el set, sino de **aceptar una oferta de la cola**: el
   * camino entra por `OFRECIDA` en vez de por `DISPONIBLE` y deja su entrada de cola
   * `CONFIRMED`. Sin un ciclo así, `ACCEPTED` y `CONFIRMED` serían dos valores del enum
   * que no aparecen en ninguna fila.
   */
  fromQueue?: boolean;
}

/**
 * El pasado de cada suscriptor, en días hacia atrás.
 *
 * Las fechas no son decorativas: cada lista empieza **después** del alta de esa cuenta
 * (`USERS` en `seed.ts`) y termina antes de su baja, si la hubo. Carla cancela hace un
 * mes y su último set volvió mucho antes; Bruno se suscribió hace uno y solo le ha dado
 * tiempo a un alquiler; Hugo tiene la suscripción en pausa y, coherentemente, nada fuera.
 */
const CYCLES: Record<string, CycleSpec[]> = {
  // Veterana con recorrido largo y limpio. Termina **sin nada fuera**: el recorrido E2E
  // cuenta con que Ana pueda pedir un set.
  "ana@example.test": [
    { startDaysAgo: 168, rentedDays: 19 },
    { startDaysAgo: 118, rentedDays: 23 },
    { startDaysAgo: 74, rentedDays: 16 },
  ],
  // Recién suscrito (un mes): un único alquiler, ya cerrado. Sin colas — el circuito
  // completo lo mete en una y `maxQueuesPerUser` es 1.
  "bruno@example.test": [{ startDaysAgo: 24, rentedDays: 9 }],
  // Se dio de baja hace un mes; sus dos alquileres son de cuando estaba activa.
  "carla@example.test": [
    { startDaysAgo: 160, rentedDays: 20 },
    { startDaysAgo: 110, rentedDays: 25 },
  ],
  // El cliente más antiguo. Su segundo set salió de una oferta de cola aceptada.
  "diego@example.test": [
    { startDaysAgo: 270, rentedDays: 24 },
    { startDaysAgo: 210, rentedDays: 20, fromQueue: true },
    { startDaysAgo: 150, rentedDays: 26 },
    { startDaysAgo: 95, rentedDays: 18 },
  ],
  // Una devolución incompleta: faltaban piezas, se repusieron y la copia volvió.
  "elena@example.test": [
    { startDaysAgo: 195, rentedDays: 18 },
    { startDaysAgo: 140, rentedDays: 25, outcome: "INCOMPLETE" },
    { startDaysAgo: 80, rentedDays: 20 },
  ],
  // Tiene un set **sin preparar**: es la fila que estrena la cola de trabajo (W2).
  "fran@example.test": [
    { startDaysAgo: 140, rentedDays: 22 },
    { startDaysAgo: 85, rentedDays: 19 },
    { startDaysAgo: 2, rentedDays: 0, stopAt: "assigned" },
  ],
  // Ha pulsado "Devolver" y espera a que el operador recoja.
  "gemma@example.test": [
    { startDaysAgo: 105, rentedDays: 20 },
    { startDaysAgo: 60, rentedDays: 15 },
    { startDaysAgo: 21, rentedDays: 18, stopAt: "returning" },
  ],
  // Suscripción en pausa: historial cerrado y nada fuera, que es lo coherente.
  "hugo@example.test": [
    { startDaysAgo: 230, rentedDays: 21 },
    { startDaysAgo: 170, rentedDays: 18 },
    { startDaysAgo: 96, rentedDays: 20 },
  ],
  // Una copia perdida por daño irreparable (baja de admin) y otra sobre la mesa de
  // inspección ahora mismo.
  "irene@example.test": [
    { startDaysAgo: 165, rentedDays: 21 },
    { startDaysAgo: 120, rentedDays: 19, outcome: "DAMAGED" },
    { startDaysAgo: 16, rentedDays: 11, stopAt: "inspecting" },
  ],
  // El más nuevo de los veteranos: dos alquileres y una cola con penalización.
  "jorge@example.test": [
    { startDaysAgo: 80, rentedDays: 14 },
    { startDaysAgo: 45, rentedDays: 17 },
  ],
};

/** Suscriptores que solo existen por este módulo: sirven de marca de idempotencia. */
export const HISTORY_ONLY_SUBSCRIBERS = [
  "diego@example.test",
  "elena@example.test",
  "fran@example.test",
  "gemma@example.test",
  "hugo@example.test",
  "irene@example.test",
  "jorge@example.test",
];

/** Observaciones de inspección: el texto libre que el catálogo cerrado no cubre. */
const INSPECTION_NOTES: Record<"OK" | "INCOMPLETE" | "DAMAGED", string | null> = {
  OK: null,
  INCOMPLETE: "Faltan 3 piezas del set (dos 1x2 rojas y una bisagra). Repuestas de stock.",
  DAMAGED: "Caja aplastada y dos piezas partidas; el modelo no se puede montar completo.",
};

const CHECKLIST_OK = { pieceCount: true, manual: true } as const;
const CHECKLIST_INCOMPLETE = { pieceCount: false, manual: true } as const;

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de tiempo
// ─────────────────────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

/** `days` días antes de `from`, a la hora indicada (para que no todo caiga a las 00:00). */
function daysBefore(from: Date, days: number, hour = 10): Date {
  const d = new Date(from.getTime() - days * DAY_MS);
  d.setHours(hour, (days * 7) % 60, 0, 0);
  return d;
}

function plusDays(from: Date, days: number, hour?: number): Date {
  const d = new Date(from.getTime() + days * DAY_MS);
  if (hour !== undefined) d.setHours(hour, from.getMinutes(), 0, 0);
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// Avisos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea los avisos de un evento **con su fecha de entonces**.
 *
 * Reutiliza `notificationsFor`, que es la misma función que usa el emisor de la
 * aplicación: si mañana cambia qué notifica un evento, este historial cambia con él.
 * Lo único propio es la fecha y el hecho de marcar como leídos los avisos viejos —un
 * contador de "sin leer" con seis meses de acumulación no informaría de nada—.
 */
async function emitAt(event: DomainEvent, at: Date, staffIds: string[], now: Date) {
  const readThreshold = now.getTime() - 10 * DAY_MS;
  const readAt = at.getTime() < readThreshold ? plusDays(at, 1) : null;

  for (const planned of notificationsFor(event)) {
    const recipients =
      planned.audience.kind === "user" ? [planned.audience.userId] : staffIds;

    for (const userId of recipients) {
      await prisma.notification.create({
        data: {
          userId,
          type: planned.type,
          payload: planned.payload as never,
          relatedEntityType: planned.relatedEntityType,
          relatedEntityId: planned.relatedEntityId,
          dedupeKey: `${planned.dedupeKey}:${userId}`,
          sentAt: at,
          readAt,
        },
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Inventario propio del historial
// ─────────────────────────────────────────────────────────────────────────────

interface PoolCopy {
  id: string;
  setId: string;
  setName: string;
  /** Instante a partir del cual la copia vuelve a estar libre. */
  freeFrom: Date;
}

/**
 * Copias que este módulo da de alta para su propio uso.
 *
 * Se reparten sobre los sets que **ya tienen dos o más copias**: añadir una a un set de
 * copia única lo sacaría del hueco que busca el recorrido E2E ("una sola copia, y libre").
 * Una copia se reutiliza en cuantos ciclos quepan sin solaparse; solo cuando ninguna está
 * libre en esa fecha se da de alta otra.
 */
class CopyPool {
  private readonly copies: PoolCopy[] = [];
  private next = 0;

  constructor(
    private readonly sets: Array<{ id: string; name: string }>,
    private readonly operatorId: string
  ) {}

  get created(): number {
    return this.copies.length;
  }

  async take(at: Date): Promise<PoolCopy> {
    const free = this.copies.find((copy) => copy.freeFrom.getTime() <= at.getTime());
    if (free) return free;

    const set = this.sets[this.next % this.sets.length]!;
    this.next++;

    // La copia entra por INTAKE un mes antes de su primer alquiler y se cataloga al día
    // siguiente: el mismo camino que la semilla base, con fechas de entonces.
    const acquiredAt = daysBefore(at, 30, 9);
    const copy = await prisma.copy.create({
      data: { setId: set.id, state: "INTAKE", acquiredAt },
    });
    await prisma.$transaction((tx) =>
      applyTransition(tx as Tx, {
        copyId: copy.id,
        fromState: "INTAKE",
        toState: "DISPONIBLE",
        actorId: this.operatorId,
        reason: "Alta de inventario",
        at: plusDays(acquiredAt, 1),
      })
    );

    const pooled: PoolCopy = {
      id: copy.id,
      setId: set.id,
      setName: set.name,
      freeFrom: plusDays(acquiredAt, 1),
    };
    this.copies.push(pooled);
    return pooled;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Un ciclo del circuito
// ─────────────────────────────────────────────────────────────────────────────

interface Actors {
  operatorIds: string[];
  adminId: string;
  staffIds: string[];
}

interface Subscriber {
  id: string;
  email: string;
  subscriptionId: string;
  address: Record<string, unknown>;
}

/**
 * Ejecuta un ciclo completo del circuito sobre una copia, paso a paso y con las fechas
 * de cada paso, hasta la etapa indicada.
 *
 * El orden es el del caso de uso real: se adjudica la copia y **después** se crea el
 * alquiler (así lo hace `assignAvailableCopy`), el registro de entrega no mueve la copia
 * —lo que la saca de la cola de trabajo es tener envío de salida—, y el alquiler se
 * cierra solo cuando la copia vuelve a circulación o se retira.
 */
async function runCycle(
  spec: CycleSpec,
  subscriber: Subscriber,
  copy: PoolCopy,
  actors: Actors,
  now: Date,
  options: { fromOffer?: { offerId: string; queueEntryId: string } } = {}
): Promise<{ rentalId: string; freeFrom: Date }> {
  const stopAt = spec.stopAt ?? "closed";
  const outcome = spec.outcome ?? "OK";
  const startedAt = daysBefore(now, spec.startDaysAgo, 11);
  // Un operador u otro según la copia: el back-office tiene dos personas y el historial
  // debe notarlo, o la columna "quién" no probaría nada.
  const operatorId = actors.operatorIds[copy.id.charCodeAt(0) % actors.operatorIds.length]!;

  // ── 1. Adjudicación ────────────────────────────────────────────────────────
  const rental = await prisma.$transaction(async (tx) => {
    const applied = await applyTransition(tx as Tx, {
      copyId: copy.id,
      fromState: options.fromOffer ? "OFRECIDA" : "DISPONIBLE",
      toState: "ALQUILADA",
      actorId: subscriber.id,
      reason: options.fromOffer
        ? "Oferta de cola aceptada"
        : "Asignación de copia al solicitar el set",
      at: startedAt,
    });
    if (!applied) throw new Error(`La copia ${copy.id} no estaba libre el ${startedAt.toISOString()}`);

    const created = await tx.rental.create({
      data: {
        copyId: copy.id,
        userId: subscriber.id,
        subscriptionId: subscriber.subscriptionId,
        type: "SUBSCRIPTION",
        status: "ACTIVE",
        shippingAddress: subscriber.address as never,
        startedAt,
      },
      select: { id: true },
    });

    if (options.fromOffer) {
      await tx.reservationOffer.update({
        where: { id: options.fromOffer.offerId },
        data: { status: "ACCEPTED", respondedAt: startedAt, rentalId: created.id },
      });
      await tx.reservationQueueEntry.update({
        where: { id: options.fromOffer.queueEntryId },
        data: { status: "CONFIRMED" },
      });
    }

    return created;
  });

  await emitAt(
    {
      type: "rental.confirmed",
      userId: subscriber.id,
      rentalId: rental.id,
      setId: copy.setId,
      setName: copy.setName,
    },
    startedAt,
    actors.staffIds,
    now
  );

  if (stopAt === "assigned") {
    return { rentalId: rental.id, freeFrom: new Date(8.64e15) };
  }

  // ── 2. Registro de condición y envío de salida ─────────────────────────────
  const deliveredAt = plusDays(startedAt, 1, 9);
  await prisma.conditionReport.create({
    data: {
      copyId: copy.id,
      rentalId: rental.id,
      operatorId,
      kind: "DELIVERY",
      checklist: CHECKLIST_OK as never,
      result: "OK",
      createdAt: deliveredAt,
    },
  });
  await prisma.shipment.create({
    data: {
      rentalId: rental.id,
      direction: "OUTBOUND",
      status: "PREPARADO",
      markedByOperatorId: operatorId,
      createdAt: deliveredAt,
    },
  });

  if (stopAt === "delivered") {
    return { rentalId: rental.id, freeFrom: new Date(8.64e15) };
  }

  // ── 3. El suscriptor inicia la devolución ──────────────────────────────────
  const returnAt = plusDays(startedAt, spec.rentedDays, 18);
  await prisma.$transaction((tx) =>
    applyTransition(tx as Tx, {
      copyId: copy.id,
      fromState: "ALQUILADA",
      toState: "EN_DEVOLUCION",
      actorId: subscriber.id,
      reason: "El suscriptor inicia la devolución",
      at: returnAt,
    })
  );
  await prisma.shipment.create({
    data: {
      rentalId: rental.id,
      direction: "RETURN",
      status: "RECOGIDA_SOLICITADA",
      markedByOperatorId: null,
      createdAt: returnAt,
    },
  });

  if (stopAt === "returning") {
    return { rentalId: rental.id, freeFrom: new Date(8.64e15) };
  }

  // ── 4. El operador la recibe ───────────────────────────────────────────────
  const receivedAt = plusDays(returnAt, 2, 10);
  await prisma.$transaction((tx) =>
    applyTransition(tx as Tx, {
      copyId: copy.id,
      fromState: "EN_DEVOLUCION",
      toState: "EN_INSPECCION",
      actorId: operatorId,
      reason: "Recepcionada por el operador",
      at: receivedAt,
    })
  );
  await emitAt(
    { type: "return.received", userId: subscriber.id, rentalId: rental.id, setName: copy.setName },
    receivedAt,
    actors.staffIds,
    now
  );

  if (stopAt === "inspecting") {
    return { rentalId: rental.id, freeFrom: new Date(8.64e15) };
  }

  // ── 5. Inspección ──────────────────────────────────────────────────────────
  const inspectedAt = plusDays(receivedAt, 0, 13);
  await prisma.conditionReport.create({
    data: {
      copyId: copy.id,
      rentalId: rental.id,
      operatorId,
      kind: "INSPECTION",
      checklist: (outcome === "OK" ? CHECKLIST_OK : CHECKLIST_INCOMPLETE) as never,
      result: outcome,
      notes: INSPECTION_NOTES[outcome],
      createdAt: inspectedAt,
    },
  });

  // ── 6. Lo que la inspección decide ─────────────────────────────────────────
  if (outcome === "DAMAGED") {
    // Baja: solo admin (D6). El alquiler se cierra con la copia, no antes.
    await prisma.$transaction((tx) =>
      applyTransition(tx as Tx, {
        copyId: copy.id,
        fromState: "EN_INSPECCION",
        toState: "BAJA",
        actorId: actors.adminId,
        reason: "Daño irreparable en la devolución",
        at: inspectedAt,
        copyData: { retiredAt: inspectedAt },
      })
    );
    await prisma.incident.create({
      data: {
        copyId: copy.id,
        rentalId: rental.id,
        reportedById: operatorId,
        assignedToId: actors.adminId,
        type: "DAMAGE",
        status: "RESOLVED",
        notes: INSPECTION_NOTES.DAMAGED,
        createdAt: inspectedAt,
      },
    });
    await emitAt(
      {
        type: "copy.retired",
        copyId: copy.id,
        setName: copy.setName,
        reason: "Daño irreparable en la devolución",
      },
      inspectedAt,
      actors.staffIds,
      now
    );
    // Retirada: no vuelve al pool nunca.
    return { rentalId: rental.id, freeFrom: new Date(8.64e15) };
  }

  let hygieneFrom: Date = inspectedAt;
  if (outcome === "INCOMPLETE") {
    await prisma.$transaction((tx) =>
      applyTransition(tx as Tx, {
        copyId: copy.id,
        fromState: "EN_INSPECCION",
        toState: "INCOMPLETA",
        actorId: operatorId,
        reason: "Faltan piezas",
        at: inspectedAt,
      })
    );
    await prisma.incident.create({
      data: {
        copyId: copy.id,
        rentalId: rental.id,
        reportedById: operatorId,
        type: "INCOMPLETE",
        status: "RESOLVED",
        notes: INSPECTION_NOTES.INCOMPLETE,
        createdAt: inspectedAt,
      },
    });
    await emitAt(
      { type: "copy.incomplete", copyId: copy.id, setName: copy.setName, rentalId: rental.id },
      inspectedAt,
      actors.staffIds,
      now
    );
    // Reponer piezas lleva unos días; hasta entonces la copia no pasa a higienización.
    hygieneFrom = plusDays(inspectedAt, 4, 11);
    await prisma.$transaction((tx) =>
      applyTransition(tx as Tx, {
        copyId: copy.id,
        fromState: "INCOMPLETA",
        toState: "EN_HIGIENIZACION",
        actorId: operatorId,
        reason: "Piezas repuestas",
        at: hygieneFrom,
      })
    );
  } else {
    hygieneFrom = plusDays(inspectedAt, 0, 16);
    await prisma.$transaction((tx) =>
      applyTransition(tx as Tx, {
        copyId: copy.id,
        fromState: "EN_INSPECCION",
        toState: "EN_HIGIENIZACION",
        actorId: operatorId,
        reason: "Inspección correcta",
        at: hygieneFrom,
      })
    );
  }

  // ── 7. Vuelta a circulación: aquí se cierra el alquiler ────────────────────
  const availableAt = plusDays(hygieneFrom, 1, 9);
  await prisma.$transaction((tx) =>
    applyTransition(tx as Tx, {
      copyId: copy.id,
      fromState: "EN_HIGIENIZACION",
      toState: "DISPONIBLE",
      actorId: operatorId,
      reason: "Vuelve a circulación",
      at: availableAt,
    })
  );
  await emitAt(
    { type: "return.completed", userId: subscriber.id, rentalId: rental.id, setName: copy.setName },
    availableAt,
    actors.staffIds,
    now
  );

  return { rentalId: rental.id, freeFrom: availableAt };
}

/**
 * Deja la copia **ofrecida** al suscriptor, con su entrada de cola y su aviso, para que
 * el ciclo siguiente la acepte.
 *
 * La ventana se abre un día antes de la aceptación: aceptar en el mismo instante en que
 * se ofrece sería un alquiler que nunca pasó por una cola de verdad.
 */
async function openOffer(
  subscriber: Subscriber,
  copy: PoolCopy,
  acceptedAt: Date,
  actors: Actors,
  now: Date
): Promise<{ offerId: string; queueEntryId: string }> {
  const offeredAt = daysBefore(acceptedAt, 1, 9);
  const windowExpiresAt = plusDays(offeredAt, 2);
  const enqueuedAt = daysBefore(offeredAt, 6, 21);

  const entry = await prisma.reservationQueueEntry.create({
    data: {
      setId: copy.setId,
      userId: subscriber.id,
      status: "OFFERED",
      enqueuedAt,
      appliedBonus: 10, // PREMIUM: bono aditivo congelado al encolar (D11)
      effectiveEntryAt: daysBefore(enqueuedAt, 10, 21),
      priorityPenalty: 0,
    },
  });
  const offer = await prisma.reservationOffer.create({
    data: {
      queueEntryId: entry.id,
      copyId: copy.id,
      status: "PENDING",
      offeredAt,
      windowExpiresAt,
    },
  });
  await prisma.$transaction((tx) =>
    applyTransition(tx as Tx, {
      copyId: copy.id,
      fromState: "DISPONIBLE",
      toState: "OFRECIDA",
      actorId: subscriber.id,
      reason: "Ofrecida a la cola",
      at: offeredAt,
    })
  );
  await emitAt(
    {
      type: "offer.created",
      userId: subscriber.id,
      offerId: offer.id,
      setId: copy.setId,
      setName: copy.setName,
      windowExpiresAt,
    },
    offeredAt,
    actors.staffIds,
    now
  );

  return { offerId: offer.id, queueEntryId: entry.id };
}

// ─────────────────────────────────────────────────────────────────────────────
// El set agotado, con su cola
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Una cola de reservas solo es coherente si el set **no tiene copias libres**: con una
 * disponible, el sistema la habría ofrecido y la cola no existiría.
 *
 * Por eso el set agotado se elige entre los **restringidos**: son los únicos que el E2E
 * descarta por definición (`setConVariasCopias` exige `!restricted`), así que dejarlos sin
 * copias libres no le quita nada. Y de paso se ejercita la regla de antigüedad: todos los
 * que aparecen aquí llevan suscritos más de los tres meses exigidos.
 *
 * Dentro va también la penalización de D5: a Jorge se le ofreció una copia, la dejó
 * caducar y volvió a la cola **detrás**, con su desplazamiento anotado. Esa misma copia
 * la alquiló Irene tres días después, que es lo que la cola tiene que conseguir.
 */
async function seedExhaustedSetWithQueue(
  subscribers: Map<string, Subscriber>,
  actors: Actors,
  now: Date
): Promise<{ setName: string; queued: number } | null> {
  const candidates = await prisma.set.findMany({
    where: { restricted: true, published: true },
    select: { id: true, name: true, copies: { select: { id: true, state: true } } },
    orderBy: { setNum: "asc" },
  });
  const target = candidates.find(
    (set) => set.copies.length === 2 && set.copies.every((copy) => copy.state === "DISPONIBLE")
  );
  if (!target) return null;

  const diego = subscribers.get("diego@example.test")!;
  const irene = subscribers.get("irene@example.test")!;
  const jorge = subscribers.get("jorge@example.test")!;
  const gemma = subscribers.get("gemma@example.test")!;

  const [first, second] = target.copies;
  if (!first || !second) return null;
  const copyOf = (id: string): PoolCopy => ({
    id,
    setId: target.id,
    setName: target.name,
    freeFrom: now,
  });

  // Copia 1 — en manos de Diego desde hace mes y medio.
  await runCycle(
    { startDaysAgo: 44, rentedDays: 0, stopAt: "delivered" },
    diego,
    copyOf(first.id),
    actors,
    now
  );

  // Copia 2 — antes de acabar en manos de Irene pasó por la cola de Jorge.
  const offeredAt = daysBefore(now, 20, 8);
  const windowExpiresAt = plusDays(offeredAt, 2);
  const jorgeEntry = await prisma.reservationQueueEntry.create({
    data: {
      setId: target.id,
      userId: jorge.id,
      status: "WAITING",
      enqueuedAt: daysBefore(now, 33, 20),
      appliedBonus: 0,
      // Entrada efectiva desplazada por la penalización de la oferta caducada (D5): la
      // cruda sigue siendo la de hace 33 días, y esa diferencia **es** el castigo.
      effectiveEntryAt: daysBefore(now, 26, 20),
      priorityPenalty: 7,
    },
  });
  const jorgeOffer = await prisma.reservationOffer.create({
    data: {
      queueEntryId: jorgeEntry.id,
      copyId: second.id,
      status: "EXPIRED",
      offeredAt,
      windowExpiresAt,
      reminderSentAt: plusDays(offeredAt, 1),
      respondedAt: windowExpiresAt,
    },
  });
  await prisma.$transaction((tx) =>
    applyTransition(tx as Tx, {
      copyId: second.id,
      fromState: "DISPONIBLE",
      toState: "OFRECIDA",
      actorId: jorge.id,
      reason: "Ofrecida a la cola",
      at: offeredAt,
    })
  );
  await emitAt(
    {
      type: "offer.created",
      userId: jorge.id,
      offerId: jorgeOffer.id,
      setId: target.id,
      setName: target.name,
      windowExpiresAt,
    },
    offeredAt,
    actors.staffIds,
    now
  );
  await emitAt(
    { type: "offer.reminder", userId: jorge.id, offerId: jorgeOffer.id, setId: target.id, setName: target.name },
    plusDays(offeredAt, 1),
    actors.staffIds,
    now
  );
  await prisma.$transaction((tx) =>
    applyTransition(tx as Tx, {
      copyId: second.id,
      fromState: "OFRECIDA",
      toState: "DISPONIBLE",
      actorId: jorge.id,
      reason: "Oferta caducada",
      at: windowExpiresAt,
    })
  );
  await emitAt(
    { type: "offer.expired", userId: jorge.id, offerId: jorgeOffer.id, setId: target.id, setName: target.name },
    windowExpiresAt,
    actors.staffIds,
    now
  );

  await runCycle(
    { startDaysAgo: 15, rentedDays: 0, stopAt: "delivered" },
    irene,
    copyOf(second.id),
    actors,
    now
  );

  // Gemma entra en la cola después: por detrás de Jorge incluso con su penalización.
  await prisma.reservationQueueEntry.create({
    data: {
      setId: target.id,
      userId: gemma.id,
      status: "WAITING",
      enqueuedAt: daysBefore(now, 9, 12),
      appliedBonus: 10, // PREMIUM: bono aditivo congelado al encolar (D11)
      effectiveEntryAt: daysBefore(now, 19, 12),
      priorityPenalty: 0,
    },
  });

  return { setName: target.name, queued: 2 };
}

// ─────────────────────────────────────────────────────────────────────────────

export interface HistoryResult {
  skipped: boolean;
  rentals: number;
  copies: number;
  exhaustedSet: string | null;
}

export async function seedRentalHistory(userIds: Map<string, string>): Promise<HistoryResult> {
  const already = await prisma.rental.count({
    where: { user: { email: { in: HISTORY_ONLY_SUBSCRIBERS } } },
  });
  if (already > 0) return { skipped: true, rentals: 0, copies: 0, exhaustedSet: null };

  const now = new Date();

  const staff = await prisma.user.findMany({
    where: { role: { in: ["OPERATOR", "ADMIN"] }, status: "ACTIVE" },
    select: { id: true, role: true },
    orderBy: { email: "asc" },
  });
  const actors: Actors = {
    operatorIds: staff.filter((u) => u.role === "OPERATOR").map((u) => u.id),
    adminId: staff.find((u) => u.role === "ADMIN")!.id,
    staffIds: staff.map((u) => u.id),
  };

  // Sets con dos o más copias y sin restricción: los únicos donde el historial puede dar
  // de alta copias sin tocar los huecos que busca el E2E.
  const poolSets = (
    await prisma.set.findMany({
      where: { restricted: false, published: true },
      select: { id: true, name: true, _count: { select: { copies: true } } },
      orderBy: { setNum: "asc" },
    })
  ).filter((set) => set._count.copies >= 2);
  const pool = new CopyPool(poolSets, actors.operatorIds[0]!);

  // Datos del suscriptor que cada alquiler necesita: su suscripción y su dirección, que
  // viaja al alquiler como copia inmutable (D10).
  const subscribers = new Map<string, Subscriber>();
  for (const email of Object.keys(CYCLES)) {
    const id = userIds.get(email);
    if (!id) continue;
    const subscription = await prisma.subscription.findFirst({ where: { userId: id } });
    const address = await prisma.address.findFirst({ where: { userId: id } });
    if (!subscription || !address) continue;
    subscribers.set(email, {
      id,
      email,
      subscriptionId: subscription.id,
      address: {
        line1: address.line1,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country,
      },
    });
  }

  let rentals = 0;

  for (const [email, specs] of Object.entries(CYCLES)) {
    const subscriber = subscribers.get(email);
    if (!subscriber) continue;

    // De la más antigua a la más reciente: es el orden en que ocurrieron, y el que
    // permite que una copia sirva a varios ciclos sin solaparse.
    for (const spec of [...specs].sort((a, b) => b.startDaysAgo - a.startDaysAgo)) {
      const at = daysBefore(now, spec.startDaysAgo, 11);
      const copy = await pool.take(at);
      const fromOffer = spec.fromQueue
        ? await openOffer(subscriber, copy, at, actors, now)
        : undefined;
      const { freeFrom } = await runCycle(spec, subscriber, copy, actors, now, { fromOffer });
      copy.freeFrom = freeFrom;
      rentals++;
    }
  }

  const exhausted = await seedExhaustedSetWithQueue(subscribers, actors, now);
  if (exhausted) rentals += 2;

  return {
    skipped: false,
    rentals,
    copies: pool.created,
    exhaustedSet: exhausted?.setName ?? null,
  };
}
