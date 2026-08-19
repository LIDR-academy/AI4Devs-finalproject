import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { NOTIFICATION_TYPES } from "@/domain/notifications/events";
import {
  TONES,
  conditionResult,
  copyStatus,
  incidentStatus,
  notificationLabel,
  offerStatus,
  queueStatus,
  rentalStatus,
  roleLabel,
  simultaneousSets,
  subscriptionStatus,
  userStatus,
  type StatusLabel,
} from "@/lib/status";

/**
 * La fuente de verdad de los estados es el esquema, no una lista copiada aquí: si
 * alguien añade un valor a un enum de Prisma y no le pone etiqueta, el estado
 * aparecería en pantalla en MAYÚSCULAS_CON_GUIONES. Esta prueba lo impide leyendo
 * el propio `schema.prisma`.
 */
// Se resuelve desde la raíz del proyecto y no con `import.meta.url`: bajo jsdom
// Vitest reescribe esa URL a `http://…` y `fileURLToPath` la rechaza.
const SCHEMA = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");

function enumValues(name: string): string[] {
  const block = new RegExp(`enum\\s+${name}\\s*\\{([^}]*)\\}`).exec(SCHEMA);
  if (!block) throw new Error(`El enum ${name} ya no existe en schema.prisma`);
  return block[1]
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, "").trim())
    .filter((line) => /^[A-Z][A-Z_]*$/.test(line));
}

function expectUsable(status: StatusLabel, context: string) {
  expect(status.label, context).toBeTruthy();
  expect(TONES, context).toContain(status.tone);
  // Un enum sin traducir se cuela como `EN_DEVOLUCION`; una etiqueta de verdad no
  // puede ser toda mayúsculas y guiones bajos.
  expect(status.label, context).not.toMatch(/^[A-Z][A-Z_]*$/);
}

describe("Vocabulario de estados — cobertura del esquema", () => {
  const surfaces = ["subscriber", "backoffice"] as const;

  it.each(surfaces)("CopyState tiene etiqueta para los 9 estados (%s)", (surface) => {
    const states = enumValues("CopyState");
    expect(states).toHaveLength(9);
    for (const state of states) {
      expectUsable(copyStatus(state as never, surface), `${state}/${surface}`);
    }
  });

  it.each(surfaces)("QueueEntryStatus tiene etiqueta (%s)", (surface) => {
    for (const status of enumValues("QueueEntryStatus")) {
      expectUsable(queueStatus(status as never, surface), `${status}/${surface}`);
    }
  });

  it.each(surfaces)("RentalStatus tiene etiqueta (%s)", (surface) => {
    for (const status of enumValues("RentalStatus")) {
      expectUsable(rentalStatus(status as never, surface), `${status}/${surface}`);
    }
  });

  it("los enums de una sola lectura también están cubiertos", () => {
    for (const status of enumValues("OfferStatus")) expectUsable(offerStatus(status as never), status);
    for (const status of enumValues("SubscriptionStatus"))
      expectUsable(subscriptionStatus(status as never), status);
    for (const status of enumValues("UserStatus")) expectUsable(userStatus(status as never), status);
    for (const status of enumValues("IncidentStatus"))
      expectUsable(incidentStatus(status as never), status);
    for (const result of enumValues("ConditionResult"))
      expectUsable(conditionResult(result as never), result);
  });

  it("los tres roles tienen nombre en castellano", () => {
    for (const role of enumValues("Role")) {
      const label = roleLabel(role as never);
      expect(label, role).toBeTruthy();
      expect(label, role).not.toMatch(/^[A-Z][A-Z_]*$/);
    }
  });

  it("cada tipo de aviso se traduce a una frase legible", () => {
    for (const type of NOTIFICATION_TYPES) {
      const label = notificationLabel(type);
      expect(label, type).not.toBe(type);
      expect(label, type).not.toMatch(/^[A-Z][A-Z_]*$/);
    }
  });

  it("un tipo de aviso desconocido se muestra tal cual en vez de romper la lista", () => {
    expect(notificationLabel("ALGO_NUEVO")).toBe("ALGO_NUEVO");
  });
});

describe("Vocabulario de estados — qué ve cada rol", () => {
  it("al suscriptor el circuito de devolución le llega como un solo hecho", () => {
    const returning = ["EN_DEVOLUCION", "EN_INSPECCION", "EN_HIGIENIZACION", "INCOMPLETA"] as const;
    const labels = new Set(returning.map((s) => copyStatus(s, "subscriber").label));
    expect(labels).toEqual(new Set(["Devolución en curso"]));
    // Y ninguno de ellos le alarma: no tiene nada que hacer.
    for (const state of returning) expect(copyStatus(state, "subscriber").tone).toBe("info");
  });

  it("al operador esos mismos estados le llegan distinguidos, que es su trabajo", () => {
    const returning = ["EN_DEVOLUCION", "EN_INSPECCION", "EN_HIGIENIZACION", "INCOMPLETA"] as const;
    const labels = new Set(returning.map((s) => copyStatus(s, "backoffice").label));
    expect(labels.size).toBe(returning.length);
  });

  it("el tono mide la urgencia de quien mira, no el estado en sí", () => {
    expect(copyStatus("EN_INSPECCION", "backoffice").tone).toBe("warning");
    expect(copyStatus("EN_INSPECCION", "subscriber").tone).toBe("info");
  });

  it("lo único que reclama al suscriptor es su turno en la cola", () => {
    const status = ["WAITING", "OFFERED", "CONFIRMED", "EXPIRED", "LEFT"] as const;
    const urgent = status.filter((s) => queueStatus(s, "subscriber").tone === "warning");
    expect(urgent).toEqual(["OFFERED"]);
  });

  it("solo ALQUILADA significa 'lo tienes en casa'", () => {
    expect(copyStatus("ALQUILADA", "subscriber").label).toBe("En tu poder");
    expect(copyStatus("EN_DEVOLUCION", "subscriber").label).not.toBe("En tu poder");
  });

  it("las plazas del plan se dicen en singular cuando es una", () => {
    expect(simultaneousSets(1)).toBe("1 set en casa a la vez");
    expect(simultaneousSets(3)).toBe("3 sets en casa a la vez");
  });
});

describe("Badge", () => {
  it("pinta la etiqueta y aplica el tono", () => {
    render(<StatusBadge status={copyStatus("INCOMPLETA", "backoffice")} />);
    const badge = screen.getByText("Incompleta");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("--tone-danger");
  });

  it("sin tono cae en el neutro, nunca en un color que signifique algo", () => {
    render(<Badge>Borrador</Badge>);
    expect(screen.getByText("Borrador").className).toContain("--tone-neutral");
  });
});
