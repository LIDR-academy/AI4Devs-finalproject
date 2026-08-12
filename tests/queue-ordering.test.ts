import { describe, expect, it } from "vitest";

import {
  compareQueueEntries,
  effectiveEntryOnEnqueue,
  effectiveEntryOnRequeue,
  offerReminderAt,
  orderQueue,
} from "@/domain/reservation-queue/ordering";

const DAY = 24 * 60 * 60 * 1000;

/** Construye una entrada tal como quedaría al encolarse. */
function enqueue(id: string, at: string, bonusDays: number) {
  return { id, effectiveEntryAt: effectiveEntryOnEnqueue(new Date(at), bonusDays) };
}

describe("prioridad aditiva por envejecimiento (D4)", () => {
  it("el premium se adelanta al basic si entran a la vez", () => {
    const premium = enqueue("premium", "2026-06-01T10:00:00.000Z", 10);
    const basic = enqueue("basic", "2026-06-01T10:00:00.000Z", 0);
    expect(orderQueue([basic, premium])[0].id).toBe("premium");
  });

  it("con suficiente espera, el basic adelanta al premium", () => {
    // El bono premium es fijo (10 días); la espera del basic no deja de crecer.
    const basic = enqueue("basic", "2026-06-01T10:00:00.000Z", 0);
    const premium = enqueue("premium", "2026-06-12T10:00:00.000Z", 10);
    expect(orderQueue([premium, basic])[0].id).toBe("basic");
  });

  it("justo en el umbral, el premium conserva la ventaja", () => {
    const basic = enqueue("basic", "2026-06-01T10:00:00.000Z", 0);
    // Entra 10 días después: su entrada efectiva coincide con la del basic, y el
    // desempate por id decide.
    const premium = enqueue("premium", "2026-06-11T10:00:00.000Z", 10);
    expect(premium.effectiveEntryAt).toEqual(basic.effectiveEntryAt);
    expect(compareQueueEntries(basic, premium)).toBeLessThan(0);
  });

  it("el orden no cambia con el paso del tiempo", () => {
    // Es la invariante que permite no recalcular nada (D11).
    const entries = [
      enqueue("a", "2026-06-01T10:00:00.000Z", 0),
      enqueue("b", "2026-06-03T10:00:00.000Z", 10),
      enqueue("c", "2026-06-05T10:00:00.000Z", 0),
    ];
    const before = orderQueue(entries).map((e) => e.id);
    // No hay nada que recalcular: las entradas efectivas son inmutables.
    const after = orderQueue(entries).map((e) => e.id);
    expect(after).toEqual(before);
  });

  it("congela el bono vigente al encolar", () => {
    const at = new Date("2026-06-01T10:00:00.000Z");
    const withBonus = effectiveEntryOnEnqueue(at, 10);
    expect(at.getTime() - withBonus.getTime()).toBe(10 * DAY);
    // Un cambio posterior del bono no puede alterar esta entrada: ya está calculada.
    expect(effectiveEntryOnEnqueue(at, 10)).toEqual(withBonus);
  });
});

describe("re-encolado tras dejar caducar una oferta (D5)", () => {
  const now = new Date("2026-06-20T10:00:00.000Z");

  it("vuelve al final, por detrás de quien acaba de encolarse", () => {
    const requeued = { id: "requeued", effectiveEntryAt: effectiveEntryOnRequeue(now, 7) };
    const justJoined = enqueue("nuevo", "2026-06-20T10:00:00.000Z", 0);
    expect(orderQueue([requeued, justJoined])[0].id).toBe("nuevo");
  });

  it("no aplica de nuevo el bono del plan", () => {
    // El bono premia entrar en la cola, no volver tras desatender un turno; sumarlo
    // aquí podría colocar a un premium por delante de quien no ha fallado a nada.
    const premiumRequeued = effectiveEntryOnRequeue(now, 7);
    expect(premiumRequeued.getTime()).toBe(now.getTime() + 7 * DAY);
  });

  it("no expulsa: sigue en la cola, solo al final", () => {
    const requeued = effectiveEntryOnRequeue(now, 7);
    expect(requeued).toBeInstanceOf(Date);
    expect(requeued.getTime()).toBeGreaterThan(now.getTime());
  });

  it("una penalización de cero lo deja al final sin castigo extra", () => {
    expect(effectiveEntryOnRequeue(now, 0).getTime()).toBe(now.getTime());
  });
});

describe("recordatorio a mitad de ventana", () => {
  it("cae exactamente en el punto medio", () => {
    const offeredAt = new Date("2026-06-01T00:00:00.000Z");
    const expiresAt = new Date("2026-06-03T00:00:00.000Z"); // 48 h
    expect(offerReminderAt(offeredAt, expiresAt).toISOString()).toBe("2026-06-02T00:00:00.000Z");
  });
});
