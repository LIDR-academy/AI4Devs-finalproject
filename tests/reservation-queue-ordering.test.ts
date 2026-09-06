import { describe, expect, it } from "vitest";

import {
  compareQueueEntries,
  computeEffectiveEntryAt,
  orderQueue,
  placeInQueues,
} from "@/domain/reservation-queue/ordering";

const DAY = 24 * 60 * 60 * 1000;

describe("orden de la cola por entrada efectiva inmutable (D11)", () => {
  it("resta el bono al instante de encolado", () => {
    const enqueuedAt = new Date("2026-01-10T00:00:00.000Z");
    const eff = computeEffectiveEntryAt(enqueuedAt, 3 * DAY);
    expect(eff.toISOString()).toBe("2026-01-07T00:00:00.000Z");
  });

  it("rechaza bonos negativos", () => {
    expect(() =>
      computeEffectiveEntryAt(new Date("2026-01-10T00:00:00.000Z"), -1)
    ).toThrow(RangeError);
  });

  it("con suficiente antigüedad, un BASIC adelanta a un PREMIUM que entró después", () => {
    // BASIC (sin bono) encolado hace 10 días.
    const basic = {
      id: "basic",
      effectiveEntryAt: computeEffectiveEntryAt(
        new Date("2026-01-01T00:00:00.000Z"),
        0
      ),
    };
    // PREMIUM (bono 3 días) encolado hace 5 días.
    const premium = {
      id: "premium",
      effectiveEntryAt: computeEffectiveEntryAt(
        new Date("2026-01-06T00:00:00.000Z"),
        3 * DAY
      ),
    };
    const [first] = orderQueue([premium, basic]);
    expect(first.id).toBe("basic");
  });

  it("desempata por id de forma estable y determinista", () => {
    const at = new Date("2026-01-01T00:00:00.000Z");
    const a = { id: "a", effectiveEntryAt: at };
    const b = { id: "b", effectiveEntryAt: new Date(at) };
    expect(compareQueueEntries(a, b)).toBeLessThan(0);
    expect(orderQueue([b, a]).map((e) => e.id)).toEqual(["a", "b"]);
  });
});

describe("puesto en la cola (wireframes.md §8.4)", () => {
  const at = (day: number) => new Date(`2026-01-${String(day).padStart(2, "0")}T00:00:00.000Z`);

  it("numera desde 1 con el mismo orden que sirve las ofertas", () => {
    const placements = placeInQueues([
      { id: "tarde", setId: "falcon", effectiveEntryAt: at(9) },
      { id: "pronto", setId: "falcon", effectiveEntryAt: at(3) },
      { id: "medio", setId: "falcon", effectiveEntryAt: at(5) },
    ]);
    expect(placements.get("pronto")).toEqual({ position: 1, queueLength: 3 });
    expect(placements.get("medio")).toEqual({ position: 2, queueLength: 3 });
    expect(placements.get("tarde")).toEqual({ position: 3, queueLength: 3 });
  });

  it("cuenta cada Set por separado: dos colas no se suman", () => {
    const placements = placeInQueues([
      { id: "a1", setId: "falcon", effectiveEntryAt: at(1) },
      { id: "a2", setId: "falcon", effectiveEntryAt: at(2) },
      { id: "b1", setId: "titanic", effectiveEntryAt: at(3) },
    ]);
    expect(placements.get("a2")).toEqual({ position: 2, queueLength: 2 });
    // Entró la última de las tres y aun así es la primera de su cola.
    expect(placements.get("b1")).toEqual({ position: 1, queueLength: 1 });
  });

  it("con empate de entrada efectiva, el puesto lo decide el id (D11)", () => {
    const placements = placeInQueues([
      { id: "b", setId: "falcon", effectiveEntryAt: at(1) },
      { id: "a", setId: "falcon", effectiveEntryAt: at(1) },
    ]);
    expect(placements.get("a")?.position).toBe(1);
    expect(placements.get("b")?.position).toBe(2);
  });

  it("sin entradas no inventa colas", () => {
    expect(placeInQueues([]).size).toBe(0);
  });
});
