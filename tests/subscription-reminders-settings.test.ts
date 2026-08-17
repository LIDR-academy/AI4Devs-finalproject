import { describe, expect, it } from "vitest";

import { resolveSettings, SYSTEM_SETTINGS } from "@/domain/settings/system-settings";
import { isReminderDue, nextReminderAt } from "@/domain/subscriptions/retention-reminder";

/**
 * El bloque de precio del alquiler puntual vivía aquí. Con la retirada de esa vía
 * (`plan-obligatorio-en-alta`) desaparecen la fórmula y sus dos parámetros; el
 * comportamiento que la sustituye —rechazar la solicitud sin plan activo— se prueba en
 * `rental-circuit.test.ts`, que es donde está la solicitud.
 */

describe("recordatorios de retención (D7)", () => {
  const NOW = new Date("2026-06-15T10:00:00.000Z");
  const base = { enabled: true, cadenceDays: 7, queueLength: 3, now: NOW };

  it("toca cuando ha pasado la cadencia y hay cola", () => {
    expect(isReminderDue({ ...base, since: new Date("2026-06-08T10:00:00.000Z") })).toBe(true);
  });

  it("no toca antes de tiempo", () => {
    expect(isReminderDue({ ...base, since: new Date("2026-06-10T10:00:00.000Z") })).toBe(false);
  });

  it("no recuerda nada si nadie espera ese set", () => {
    // Son recordatorios amables: sin cola, meter prisa solo molesta.
    expect(
      isReminderDue({ ...base, queueLength: 0, since: new Date("2026-01-01T10:00:00.000Z") })
    ).toBe(false);
  });

  it("no recuerda nada si el admin no los ha activado", () => {
    expect(
      isReminderDue({ ...base, enabled: false, since: new Date("2026-01-01T10:00:00.000Z") })
    ).toBe(false);
  });

  it("respeta la cadencia configurada", () => {
    const since = new Date("2026-06-05T10:00:00.000Z"); // 10 días atrás
    expect(isReminderDue({ ...base, since, cadenceDays: 7 })).toBe(true);
    expect(isReminderDue({ ...base, since, cadenceDays: 14 })).toBe(false);
  });

  it("una cadencia de cero o negativa no dispara recordatorios en bucle", () => {
    const since = new Date("2026-06-05T10:00:00.000Z");
    expect(isReminderDue({ ...base, since, cadenceDays: 0 })).toBe(false);
    expect(isReminderDue({ ...base, since, cadenceDays: -3 })).toBe(false);
  });

  it("calcula cuándo tocaría el siguiente", () => {
    expect(nextReminderAt(new Date("2026-06-01T10:00:00.000Z"), 7).toISOString()).toBe(
      "2026-06-08T10:00:00.000Z"
    );
  });
});

describe("parámetros configurables del sistema", () => {
  it("usa los valores guardados cuando son válidos", () => {
    const settings = resolveSettings({ restrictedSetMinMonths: 6, maxQueuesPerUser: 3 });
    expect(settings.restrictedSetMinMonths).toBe(6);
    expect(settings.maxQueuesPerUser).toBe(3);
  });

  it("cae al valor por defecto si falta la fila", () => {
    const settings = resolveSettings({});
    expect(settings).toEqual(SYSTEM_SETTINGS);
  });

  it("ignora valores corruptos en vez de tumbar la regla de negocio", () => {
    // Un dato malo en la base no puede dejar sin criterio a una regla de negocio.
    const settings = resolveSettings({
      restrictedSetMinMonths: "tres",
      // `Number(null)` vale 0: sin el descarte explícito se colaría como configuración
      // válida y dejaría el parámetro a cero sin que nadie lo pidiera.
      expiredOfferPenaltyDays: null,
      maxQueuesPerUser: -5,
    });
    expect(settings.restrictedSetMinMonths).toBe(SYSTEM_SETTINGS.restrictedSetMinMonths);
    expect(settings.expiredOfferPenaltyDays).toBe(SYSTEM_SETTINGS.expiredOfferPenaltyDays);
    expect(settings.maxQueuesPerUser).toBe(SYSTEM_SETTINGS.maxQueuesPerUser);
  });

  it("acepta números en texto, que es como pueden llegar de un JSON", () => {
    expect(resolveSettings({ maxQueuesPerUser: "4" }).maxQueuesPerUser).toBe(4);
  });
});
