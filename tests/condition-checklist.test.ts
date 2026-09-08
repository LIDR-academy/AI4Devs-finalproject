import { describe, expect, it } from "vitest";

import {
  CONDITION_CHECKLIST_IDS,
  checklistItemLabel,
  emptyChecklist,
} from "@/domain/rentals/condition-checklist";
import { ChecklistSchema } from "@/http/condition-checklist-schema";

/**
 * El catálogo de comprobaciones ratificado (`wireframes.md` §4.3) y su validación.
 *
 * Lo que protege: que los informes de **entrega** e **inspección** de un mismo alquiler
 * sigan siendo comparables campo a campo. Si dejan de serlo, registrarlos no sirve para
 * nada — sin un "antes" con las mismas casillas, una pieza que falta al volver no se
 * puede atribuir a nadie.
 */
describe("catálogo de comprobaciones", () => {
  it("son las dos ratificadas, y en el mismo orden en toda la aplicación", () => {
    expect(CONDITION_CHECKLIST_IDS).toEqual(["pieceCount", "manual"]);
  });

  it("el formulario arranca con todo sin marcar", () => {
    // Marcar es un acto explícito del operador: una casilla premarcada se firma sin mirar.
    expect(emptyChecklist()).toEqual({ pieceCount: false, manual: false });
  });

  it("una casilla que ya no está en el catálogo se enseña por su id", () => {
    // Los informes guardados son historia y no se reescriben: si un día se retira un
    // ítem, los antiguos lo siguen trayendo y hay que poder pintarlos.
    expect(checklistItemLabel("manual")).toBe("Manual de instrucciones incluido");
    expect(checklistItemLabel("embalaje")).toBe("embalaje");
  });
});

describe("validación de la lista", () => {
  it("acepta la lista completa", () => {
    expect(ChecklistSchema.parse({ pieceCount: true, manual: false })).toEqual({
      pieceCount: true,
      manual: false,
    });
  });

  it("acepta que no haya lista: `null` significa «no se registró»", () => {
    expect(ChecklistSchema.parse(null)).toBeNull();
    expect(ChecklistSchema.parse(undefined)).toBeUndefined();
  });

  it("rechaza media lista", () => {
    // Un informe con media lista no se puede comparar con el de la otra punta.
    expect(ChecklistSchema.safeParse({ pieceCount: true }).success).toBe(false);
  });

  it("rechaza casillas que no están en el catálogo", () => {
    // Antes era `z.record(z.string(), z.unknown())` y entraba cualquier cosa.
    expect(
      ChecklistSchema.safeParse({ pieceCount: true, manual: true, embalaje: true }).success
    ).toBe(false);
    expect(ChecklistSchema.safeParse({ piezas: "completas" }).success).toBe(false);
  });

  it("rechaza texto libre en una casilla", () => {
    // Lo que no cabe en un sí/no va a observaciones, que es otro campo del informe.
    expect(ChecklistSchema.safeParse({ pieceCount: "sí", manual: true }).success).toBe(false);
  });
});
