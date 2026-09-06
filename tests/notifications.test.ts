import { describe, expect, it } from "vitest";

import {
  notificationsFor,
  NOTIFICATION_TYPES,
  type DomainEvent,
} from "@/domain/notifications/events";
import type {
  NotificationRepository,
  NotificationView,
} from "@/repositories/notification.repository";
import { emit } from "@/use-cases/notifications/notify";

const AT = new Date("2026-08-01T10:00:00.000Z");
const WINDOW = new Date("2026-08-03T10:00:00.000Z");

/** Doble en memoria con la misma garantía de unicidad que el índice de la base. */
class FakeNotificationRepository implements NotificationRepository {
  readonly rows: Array<{ userId: string; type: string; dedupeKey: string | null }> = [];
  staff: string[] = ["operador-1", "admin-1"];
  failOnce = false;

  async create(input: { userId: string; type: string; dedupeKey?: string | null }) {
    if (this.failOnce) {
      this.failOnce = false;
      throw new Error("fallo simulado del transporte");
    }
    if (input.dedupeKey && this.rows.some((r) => r.dedupeKey === input.dedupeKey)) {
      return false;
    }
    this.rows.push({
      userId: input.userId,
      type: input.type,
      dedupeKey: input.dedupeKey ?? null,
    });
    return true;
  }

  async listStaffRecipients() {
    return this.staff;
  }
  async listForUser(): Promise<readonly NotificationView[]> {
    return [];
  }
  // El emisor no lee el buzón; el puerto lo exige porque lo usa la cabecera del portal.
  async countUnread() {
    return 0;
  }
  async markRead() {
    return true;
  }
}

const EVENTS: DomainEvent[] = [
  { type: "offer.created", userId: "ana", offerId: "o1", setId: "s1", setName: "Falcon", windowExpiresAt: WINDOW },
  { type: "offer.reminder", userId: "ana", offerId: "o1", setId: "s1", setName: "Falcon" },
  { type: "offer.expired", userId: "ana", offerId: "o1", setId: "s1", setName: "Falcon" },
  { type: "rental.confirmed", userId: "ana", rentalId: "r1", setId: "s1", setName: "Falcon" },
  { type: "return.received", userId: "ana", rentalId: "r1", setName: "Falcon" },
  { type: "return.completed", userId: "ana", rentalId: "r1", setName: "Falcon" },
  { type: "retention.reminder", userId: "ana", rentalId: "r1", setName: "Falcon", cycle: "2026-08-01" },
  { type: "copy.incomplete", copyId: "c1", setName: "Falcon", rentalId: "r1" },
  { type: "copy.retired", copyId: "c1", setName: "Falcon", reason: "rota" },
  { type: "delivery.discrepancy", copyId: "c1", rentalId: "r1", setName: "Falcon", notes: "faltan piezas" },
  { type: "password-reset.requested", userId: "ana", tokenId: "t1", expiresAt: WINDOW },
  { type: "password.changed", userId: "ana", tokenId: "t1" },
];

/** Los tres que van al back-office; el resto son del titular de la cuenta. */
const BACKOFFICE_EVENTS = EVENTS.slice(7, 10);

describe("mapa de eventos a notificaciones (7.1)", () => {
  it("todo evento del dominio produce al menos una notificación", () => {
    for (const event of EVENTS) {
      expect(notificationsFor(event).length).toBeGreaterThan(0);
    }
  });

  it("usa solo tipos del catálogo cerrado", () => {
    for (const event of EVENTS) {
      for (const planned of notificationsFor(event)) {
        expect(NOTIFICATION_TYPES).toContain(planned.type);
      }
    }
  });

  it("cada evento genera una clave de idempotencia distinta", () => {
    const keys = EVENTS.flatMap((event) => notificationsFor(event).map((n) => n.dedupeKey));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("el mismo evento produce siempre la misma clave", () => {
    const event = EVENTS[0];
    expect(notificationsFor(event)[0].dedupeKey).toBe(notificationsFor(event)[0].dedupeKey);
  });
});

describe("eventos al suscriptor (7.2)", () => {
  it("«te toca» incluye hasta cuándo puede confirmar", () => {
    const [planned] = notificationsFor(EVENTS[0]);
    expect(planned.type).toBe("QUEUE_TURN");
    // Avisar sin decir hasta cuándo obligaría a entrar en la aplicación para saber
    // si aún se está a tiempo.
    expect(planned.payload.windowExpiresAt).toBe(WINDOW.toISOString());
  });

  it("dirige al suscriptor los avisos de su actividad", () => {
    for (const event of EVENTS.slice(0, 7)) {
      const [planned] = notificationsFor(event);
      expect(planned.audience).toEqual({ kind: "user", userId: "ana" });
    }
  });

  it("el recordatorio de retención cambia de clave en cada ciclo", () => {
    // A diferencia del resto, este aviso debe repetirse cada X días.
    const base = { type: "retention.reminder", userId: "ana", rentalId: "r1", setName: "Falcon" } as const;
    const first = notificationsFor({ ...base, cycle: "2026-08-01" })[0];
    const second = notificationsFor({ ...base, cycle: "2026-08-08" })[0];
    expect(first.dedupeKey).not.toBe(second.dedupeKey);
  });
});

describe("eventos internos al back-office (7.3)", () => {
  it("la copia incompleta y la baja van al back-office, no al suscriptor", () => {
    for (const event of BACKOFFICE_EVENTS) {
      expect(notificationsFor(event)[0].audience).toEqual({ kind: "backoffice" });
    }
  });

  it("reparte el aviso interno entre todo el personal", async () => {
    const notifications = new FakeNotificationRepository();
    const result = await emit({ notifications, now: () => AT }, EVENTS[8]);

    expect(result.sent).toBe(2);
    expect(notifications.rows.map((r) => r.userId).sort()).toEqual(["admin-1", "operador-1"]);
  });

  it("cada destinatario recibe el suyo, pero solo uno", async () => {
    const notifications = new FakeNotificationRepository();
    await emit({ notifications, now: () => AT }, EVENTS[8]);
    const repeat = await emit({ notifications, now: () => AT }, EVENTS[8]);

    expect(repeat.sent).toBe(0);
    expect(repeat.duplicates).toBe(2);
    expect(notifications.rows).toHaveLength(2);
  });
});

describe("avisos de seguridad de la cuenta", () => {
  it("avisan al titular, no al back-office", () => {
    for (const event of EVENTS.slice(10)) {
      expect(notificationsFor(event)[0].audience).toEqual({ kind: "user", userId: "ana" });
    }
  });

  it("la solicitud dice hasta cuándo sirve el enlace, pero no lleva el enlace", () => {
    const [planned] = notificationsFor(EVENTS[10]);
    expect(planned.type).toBe("PASSWORD_RESET_REQUESTED");
    expect(planned.payload).toEqual({ expiresAt: WINDOW.toISOString() });
  });

  it("solicitar y cambiar son dos avisos distintos del mismo enlace", async () => {
    const notifications = new FakeNotificationRepository();
    await emit({ notifications, now: () => AT }, EVENTS[10]);
    await emit({ notifications, now: () => AT }, EVENTS[11]);

    expect(notifications.rows.map((r) => r.type)).toEqual([
      "PASSWORD_RESET_REQUESTED",
      "PASSWORD_CHANGED",
    ]);
  });
});

describe("no se duplican ni se pierden (7.4)", () => {
  it("reemitir el mismo evento no genera un segundo aviso", async () => {
    const notifications = new FakeNotificationRepository();

    const first = await emit({ notifications, now: () => AT }, EVENTS[0]);
    const second = await emit({ notifications, now: () => AT }, EVENTS[0]);

    expect(first).toEqual({ sent: 1, duplicates: 0 });
    expect(second).toEqual({ sent: 0, duplicates: 1 });
    expect(notifications.rows).toHaveLength(1);
  });

  it("eventos distintos sobre la misma entidad sí generan avisos distintos", async () => {
    const notifications = new FakeNotificationRepository();
    await emit({ notifications, now: () => AT }, EVENTS[3]); // alquiler confirmado
    await emit({ notifications, now: () => AT }, EVENTS[4]); // devolución recibida
    await emit({ notifications, now: () => AT }, EVENTS[5]); // devolución completada

    expect(notifications.rows.map((r) => r.type)).toEqual([
      "RENTAL_CONFIRMED",
      "RETURN_RECEIVED",
      "RETURN_COMPLETED",
    ]);
  });

  it("un fallo al notificar no propaga: el negocio ya ocurrió", async () => {
    const notifications = new FakeNotificationRepository();
    notifications.failOnce = true;

    // Que no se pueda avisar no puede tumbar el alquiler o la baja que ya son un hecho.
    await expect(emit({ notifications, now: () => AT }, EVENTS[0])).resolves.toEqual({
      sent: 0,
      duplicates: 0,
    });
  });

  it("un fallo con un destinatario no deja sin aviso a los demás", async () => {
    const notifications = new FakeNotificationRepository();
    notifications.failOnce = true;

    const result = await emit({ notifications, now: () => AT }, EVENTS[8]);
    // El fallo corta ese abanico, pero no derriba el proceso ni se pierde el resto
    // de eventos posteriores.
    expect(result.sent).toBe(0);
    await expect(emit({ notifications, now: () => AT }, EVENTS[8])).resolves.toMatchObject({
      sent: 2,
    });
  });

  it("sin personal en el back-office no se pierde nada ni se rompe", async () => {
    const notifications = new FakeNotificationRepository();
    notifications.staff = [];
    await expect(emit({ notifications, now: () => AT }, EVENTS[8])).resolves.toEqual({
      sent: 0,
      duplicates: 0,
    });
  });
});
