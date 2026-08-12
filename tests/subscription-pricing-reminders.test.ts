import { describe, expect, it } from "vitest";

import { resolveSettings, SYSTEM_SETTINGS } from "@/domain/settings/system-settings";
import { computeOneOffPrice } from "@/domain/subscriptions/pricing";
import { isReminderDue, nextReminderAt } from "@/domain/subscriptions/retention-reminder";

describe("precio del alquiler puntual (D9)", () => {
  it("aplica el porcentaje sobre el valor de referencia", () => {
    expect(computeOneOffPrice({ referenceValue: "849.99", percent: 15, minimum: 9.99 })).toEqual({
      amount: "127.50",
      minimumApplied: false,
    });
  });

  it("aplica el mínimo cuando el porcentaje se queda corto", () => {
    // Un 15 % de 19,99 € son 3 €: no cubriría ni el envío.
    expect(computeOneOffPrice({ referenceValue: "19.99", percent: 15, minimum: 9.99 })).toEqual({
      amount: "9.99",
      minimumApplied: true,
    });
  });

  it("no arrastra errores de coma flotante", () => {
    // 14.99 × 3 en coma flotante da 44.969999999999999.
    const { amount } = computeOneOffPrice({ referenceValue: "14.99", percent: 300, minimum: 0 });
    expect(amount).toBe("44.97");
  });

  it("devuelve siempre dos decimales", () => {
    expect(computeOneOffPrice({ referenceValue: "100.00", percent: 15, minimum: 0 }).amount).toBe("15.00");
    expect(computeOneOffPrice({ referenceValue: "200.00", percent: 10, minimum: 0 }).amount).toBe("20.00");
  });

  it("respeta el porcentaje configurado por el admin", () => {
    const base = { referenceValue: "100.00", minimum: 0 };
    expect(computeOneOffPrice({ ...base, percent: 15 }).amount).toBe("15.00");
    expect(computeOneOffPrice({ ...base, percent: 25 }).amount).toBe("25.00");
  });

  it("no devuelve importes negativos ni se rompe con datos absurdos", () => {
    expect(computeOneOffPrice({ referenceValue: "-50", percent: 15, minimum: 0 }).amount).toBe("0.00");
    expect(computeOneOffPrice({ referenceValue: "no-es-un-numero", percent: 15, minimum: 5 }).amount).toBe("5.00");
  });
});

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
      oneOffRentalPricePercent: null,
      maxQueuesPerUser: -5,
    });
    expect(settings.restrictedSetMinMonths).toBe(SYSTEM_SETTINGS.restrictedSetMinMonths);
    expect(settings.oneOffRentalPricePercent).toBe(SYSTEM_SETTINGS.oneOffRentalPricePercent);
    expect(settings.maxQueuesPerUser).toBe(SYSTEM_SETTINGS.maxQueuesPerUser);
  });

  it("acepta números en texto, que es como pueden llegar de un JSON", () => {
    expect(resolveSettings({ maxQueuesPerUser: "4" }).maxQueuesPerUser).toBe(4);
  });
});
