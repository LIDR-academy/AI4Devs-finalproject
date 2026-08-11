import { describe, expect, it } from "vitest";

import {
  compareQueueEntries,
  computeEffectiveEntryAt,
  orderQueue,
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
