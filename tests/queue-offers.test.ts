import { beforeEach, describe, expect, it } from "vitest";

import { ForbiddenError, InvariantViolationError, NotFoundError } from "@/domain/errors";
import { SYSTEM_SETTINGS, type SystemSettings } from "@/domain/settings/system-settings";
import type { CopyRepository } from "@/repositories/copy.repository";
import type { SettingsRepository } from "@/repositories/settings.repository";
import type { ActiveSubscription, SubscriptionRepository } from "@/repositories/subscription.repository";
import { joinQueue, leaveQueue } from "@/use-cases/queue/join-queue";
import {
  acceptOffer,
  expireOffers,
  rejectOffer,
  sendOfferReminders,
  type OfferDeps,
} from "@/use-cases/queue/respond-to-offer";
import { offerToHeadOfQueue } from "@/use-cases/rentals/advance-lifecycle";

import { FakeCopyRepository } from "./fakes/copy-repository";
import { FakeQueueRepository } from "./fakes/queue-repository";

const AT = new Date("2026-07-01T10:00:00.000Z");
const SET = "set-1";
const COPY = "copy-1";

const SUBSCRIPTION: ActiveSubscription = {
  id: "sub-1",
  userId: "ana",
  planCode: "PREMIUM",
  status: "ACTIVE",
  startedAt: new Date("2025-01-01T00:00:00.000Z"),
  maxSimultaneousSets: 2,
  queueBonusDays: 10,
};

const settings: SettingsRepository = { async load() { return { ...SYSTEM_SETTINGS }; } };

function settingsWith(overrides: Partial<SystemSettings>): SettingsRepository {
  return { async load() { return { ...SYSTEM_SETTINGS, ...overrides }; } };
}

const sets = {
  async findById(setId: string) {
    if (setId !== SET) return null;
    return {
      id: SET, setNum: null, themeId: "t", name: "Set de prueba", year: null, pieceCount: 100,
      recommendedAge: null, difficulty: null, referenceValue: "100.00", boxPhotoUrl: null,
      restricted: false, published: true,
    };
  },
  async create() { throw new Error("no usado"); },
  async update() { return null; },
  async setPublished() { return null; },
  async themeExists() { return true; },
  // La cola no lista el catálogo; el puerto los exige y aquí no se usan.
  async listManaged() { throw new Error("no usado"); },
  async listThemes() { return []; },
};

function subscriptionsFor(subscription: ActiveSubscription | null = SUBSCRIPTION): SubscriptionRepository {
  return {
    async findCurrentSubscription() { return subscription; },
    async currentCopyStates() { return []; },
    async openSubscription() { return null; },
    async updateStatus() { return null; },
    async changePlan() { return null; },
    async listPlans() { return []; },
    async updatePlan() { return null; },
  };
}

let queue: FakeQueueRepository;
let copies: FakeCopyRepository;
const notified: string[] = [];

beforeEach(() => {
  queue = new FakeQueueRepository();
  queue.copyStates.set(COPY, "DISPONIBLE");
  copies = new FakeCopyRepository([
    { id: COPY, setId: SET, state: "DISPONIBLE", acquiredAt: AT, retiredAt: null },
  ]);
  notified.length = 0;
});

function joinDeps(settingsRepo: SettingsRepository = settings, subscription = SUBSCRIPTION) {
  return { queue, subscriptions: subscriptionsFor(subscription), sets, settings: settingsRepo, now: () => AT };
}

function offerDepsFor(settingsRepo: SettingsRepository = settings, now = () => AT): OfferDeps {
  return {
    queue,
    rentals: { async findDefaultAddress() { return { line1: "Calle" }; } } as never,
    subscriptions: subscriptionsFor(),
    settings: settingsRepo,
    repository: copies as unknown as CopyRepository,
    emit: async (event) => {
      if ("userId" in event) notified.push(`${event.type}:${event.userId}`);
    },
    now,
  };
}

describe("encolado (6.1)", () => {
  it("crea la entrada con su marca de tiempo y el bono congelado", async () => {
    const entry = await joinQueue(joinDeps(), { userId: "ana", setId: SET });
    expect(entry).toMatchObject({ status: "WAITING", appliedBonusDays: 10 });
    expect(entry.enqueuedAt).toEqual(AT);
  });

  it("no deja encolarse dos veces en el mismo set", async () => {
    await joinQueue(joinDeps(), { userId: "ana", setId: SET });
    await expect(joinQueue(joinDeps(), { userId: "ana", setId: SET })).rejects.toBeInstanceOf(
      InvariantViolationError
    );
  });

  it("exige suscripción activa", async () => {
    await expect(
      joinQueue(joinDeps(settings, null as never), { userId: "ana", setId: SET })
    ).rejects.toBeInstanceOf(InvariantViolationError);
  });

  it("404 si el set no existe", async () => {
    await expect(
      joinQueue(joinDeps(), { userId: "ana", setId: "fantasma" })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("límite de colas simultáneas (6.5)", () => {
  it("rechaza al superar el límite configurado", async () => {
    const deps = joinDeps(settingsWith({ maxQueuesPerUser: 1 }));
    await joinQueue(deps, { userId: "ana", setId: SET });

    // Segunda cola, otro set: el fake acepta cualquier setId conocido, así que se
    // reutiliza el mismo usuario contra una entrada ya existente.
    queue.entries.push({
      ...queue.entries[0],
      id: "entry-otro",
      setId: "set-2",
    });

    const error = await joinQueue(deps, { userId: "ana", setId: SET }).catch(
      (caught: unknown) => caught
    );
    expect(error).toBeInstanceOf(InvariantViolationError);
  });

  it("el límite lo fija el admin", async () => {
    const deps = joinDeps(settingsWith({ maxQueuesPerUser: 3 }));
    await joinQueue(deps, { userId: "ana", setId: SET });
    expect(await queue.countActiveQueuesForUser("ana")).toBe(1);
  });
});

describe("elegibilidad al ofrecer (6.3)", () => {
  it("salta a quien tiene el tope de su plan y ofrece al siguiente", async () => {
    await joinQueue(joinDeps(), { userId: "ana", setId: SET });
    await joinQueue(joinDeps(), { userId: "bruno", setId: SET });

    // Ana está en su tope: la cola debe saltarla sin sacarla.
    queue.entries[0].subscription = { status: "ACTIVE", startedAt: new Date("2025-01-01"), maxSimultaneousSets: 1 };
    queue.entries[0].currentCopyStates = ["ALQUILADA"];
    queue.entries[1].subscription = { status: "ACTIVE", startedAt: new Date("2025-01-01"), maxSimultaneousSets: 2 };

    const offer = await offerToHeadOfQueue(
      { repository: copies as unknown as CopyRepository, queue, settings, now: () => AT },
      { copyId: COPY, setId: SET }
    );

    expect(offer?.userId).toBe("bruno");
    // Ana conserva su turno: sigue esperando.
    expect(queue.entries[0].status).toBe("WAITING");
  });

  it("no ofrece nada si nadie es elegible", async () => {
    await joinQueue(joinDeps(), { userId: "ana", setId: SET });
    queue.entries[0].subscription = { status: "PAUSED", startedAt: new Date("2025-01-01"), maxSimultaneousSets: 2 };

    const offer = await offerToHeadOfQueue(
      { repository: copies as unknown as CopyRepository, queue, settings, now: () => AT },
      { copyId: COPY, setId: SET }
    );
    expect(offer).toBeNull();
    expect(queue.copyStates.get(COPY)).toBe("DISPONIBLE");
  });
});

describe("ventana de confirmación (6.4)", () => {
  async function offerTo(userId: string) {
    await joinQueue(joinDeps(), { userId, setId: SET });
    queue.entries.at(-1)!.subscription = {
      status: "ACTIVE",
      startedAt: new Date("2025-01-01"),
      maxSimultaneousSets: 2,
    };
    const offer = await offerToHeadOfQueue(
      { repository: copies as unknown as CopyRepository, queue, settings, now: () => AT },
      { copyId: COPY, setId: SET }
    );
    return offer!;
  }

  it("aceptar asigna la copia y saca de la cola", async () => {
    const offer = await offerTo("ana");
    const result = await acceptOffer(offerDepsFor(), { userId: "ana", offerId: offer.offerId });

    expect(result.rentalId).toBeTruthy();
    expect(queue.copyStates.get(COPY)).toBe("ALQUILADA");
    expect(queue.entries[0].status).toBe("CONFIRMED");
  });

  it("no se puede aceptar la oferta de otro", async () => {
    const offer = await offerTo("ana");
    await expect(
      acceptOffer(offerDepsFor(), { userId: "bruno", offerId: offer.offerId })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("no se puede aceptar fuera de la ventana", async () => {
    const offer = await offerTo("ana");
    const late = new Date(offer.windowExpiresAt.getTime() + 1);

    await expect(
      acceptOffer(offerDepsFor(settings, () => late), { userId: "ana", offerId: offer.offerId })
    ).rejects.toBeInstanceOf(InvariantViolationError);
  });

  it("el rechazo libera la copia al instante y saca de la cola a quien rechazó", async () => {
    const offer = await offerTo("ana");
    await rejectOffer(offerDepsFor(), { userId: "ana", offerId: offer.offerId });

    // Dijo que no: sale de la cola, y la copia queda libre sin esperar al vencimiento.
    expect(queue.entries[0].status).toBe("LEFT");
    expect(queue.copyStates.get(COPY)).toBe("DISPONIBLE");
  });

  it("el rechazo pasa la oferta al siguiente elegible", async () => {
    const offer = await offerTo("ana");
    await joinQueue(joinDeps(), { userId: "bruno", setId: SET });
    queue.entries[1].subscription = { status: "ACTIVE", startedAt: new Date("2025-01-01"), maxSimultaneousSets: 2 };

    await rejectOffer(offerDepsFor(), { userId: "ana", offerId: offer.offerId });

    expect(queue.offers.at(-1)?.userId).toBe("bruno");
    expect(queue.copyStates.get(COPY)).toBe("OFRECIDA");
  });

  it("la caducidad re-encola al final con penalización, sin expulsar", async () => {
    const offer = await offerTo("ana");
    const after = new Date(offer.windowExpiresAt.getTime() + 1000);

    const result = await expireOffers(offerDepsFor(settings, () => after));

    expect(result.expired).toBe(1);
    const entry = queue.entries[0];
    // No es una expulsión: vuelve a esperar, pero al final. Y no se le vuelve a
    // ofrecer en el acto aunque sea el único en la cola.
    expect(entry.status).toBe("WAITING");
    expect(result.reoffered).toBe(0);
    expect(entry.priorityPenaltyDays).toBe(SYSTEM_SETTINGS.expiredOfferPenaltyDays);
    expect(entry.effectiveEntryAt.getTime()).toBeGreaterThan(after.getTime());
  });

  it("tras caducar, la copia se ofrece al siguiente elegible", async () => {
    const offer = await offerTo("ana");
    await joinQueue(joinDeps(), { userId: "bruno", setId: SET });
    queue.entries[1].subscription = { status: "ACTIVE", startedAt: new Date("2025-01-01"), maxSimultaneousSets: 2 };

    const after = new Date(offer.windowExpiresAt.getTime() + 1000);
    const result = await expireOffers(offerDepsFor(settings, () => after));

    expect(result.reoffered).toBe(1);
    expect(queue.offers.at(-1)?.userId).toBe("bruno");
  });

  it("el recordatorio sale a mitad de ventana y solo una vez", async () => {
    const offer = await offerTo("ana");
    const half = new Date((offer.windowExpiresAt.getTime() + AT.getTime()) / 2 + 1000);

    // Antes de la mitad no se envía nada.
    expect((await sendOfferReminders(offerDepsFor(settings, () => AT))).sent).toBe(0);

    expect((await sendOfferReminders(offerDepsFor(settings, () => half))).sent).toBe(1);
    expect(notified).toEqual(["offer.reminder:ana"]);

    // Segunda pasada: ya está marcado, no se repite.
    expect((await sendOfferReminders(offerDepsFor(settings, () => half))).sent).toBe(0);
  });
});

describe("abandono voluntario de la cola", () => {
  it("saca al usuario de la cola", async () => {
    const entry = await joinQueue(joinDeps(), { userId: "ana", setId: SET });
    await leaveQueue(joinDeps(), { userId: "ana", entryId: entry.id });
    expect(queue.entries[0].status).toBe("LEFT");
  });

  it("no se puede abandonar la cola de otro", async () => {
    const entry = await joinQueue(joinDeps(), { userId: "ana", setId: SET });
    await expect(
      leaveQueue(joinDeps(), { userId: "bruno", entryId: entry.id })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("con una oferta en curso hay que responderla antes de salir", async () => {
    const entry = await joinQueue(joinDeps(), { userId: "ana", setId: SET });
    queue.entries[0].subscription = { status: "ACTIVE", startedAt: new Date("2025-01-01"), maxSimultaneousSets: 2 };
    await offerToHeadOfQueue(
      { repository: copies as unknown as CopyRepository, queue, settings, now: () => AT },
      { copyId: COPY, setId: SET }
    );

    // Salir dejaría la copia ofrecida y bloqueada sin nadie que responda.
    await expect(
      leaveQueue(joinDeps(), { userId: "ana", entryId: entry.id })
    ).rejects.toBeInstanceOf(InvariantViolationError);
  });
});
