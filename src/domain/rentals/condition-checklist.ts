/**
 * Catálogo de comprobaciones de un informe de condición — `wireframes.md` §4.3.
 *
 * **Fuente única de verdad**, y por eso vive en el dominio: la misma lista sirve para
 * el informe de **entrega** y para el de **inspección**. Si las casillas no coinciden,
 * los dos informes de un mismo alquiler no son comparables campo a campo, que es lo
 * único que justifica registrarlos: sin un "antes", una pieza que falta al volver no
 * se puede atribuir a nadie.
 *
 * Antes de esto, `checklist` era un `Record<string, unknown>` libre en los dos
 * endpoints: se guardaba cualquier cosa y no había nada contra lo que dibujar una
 * pantalla.
 *
 * **Ratificadas el 2026-08-20** (decisión de operación, no de diseño): entran el
 * recuento de piezas y el manual. Quedaron fuera el estado de la caja —para un set de
 * construcción el embalaje casi no es valor, y para uno de exposición sí, así que una
 * casilla única mentiría en la mitad de los casos— y las piezas sueltas fuera de bolsa,
 * que en la práctica se acaba viendo en el propio recuento.
 *
 * Añadir un ítem es añadirlo aquí: la validación de los dos endpoints y la pantalla que
 * los rellena se derivan de esta lista. Ojo con quitar uno — los informes ya guardados
 * lo seguirán teniendo, porque son un registro histórico y no se reescriben.
 */

export const CONDITION_CHECKLIST_ITEMS = [
  {
    id: "pieceCount",
    label: "Recuento de piezas conforme al inventario",
    /** Es la comprobación que sostiene el resultado `INCOMPLETE`. */
    hint: "Cuenta o pesa las bolsas según el inventario del set.",
  },
  {
    id: "manual",
    label: "Manual de instrucciones incluido",
    hint: "Se pierde con facilidad y se reclama aparte de las piezas.",
  },
] as const;

export type ConditionChecklistItem = (typeof CONDITION_CHECKLIST_ITEMS)[number];
export type ConditionChecklistItemId = ConditionChecklistItem["id"];

/** Un informe trae **todas** las casillas, marcadas o no: "no la marqué" es un dato. */
export type ConditionChecklist = Record<ConditionChecklistItemId, boolean>;

export const CONDITION_CHECKLIST_IDS: readonly ConditionChecklistItemId[] =
  CONDITION_CHECKLIST_ITEMS.map((item) => item.id);

/** Etiqueta de una casilla; el `id` crudo si el informe guardado trae una que ya no está. */
export function checklistItemLabel(id: string): string {
  return CONDITION_CHECKLIST_ITEMS.find((item) => item.id === id)?.label ?? id;
}

/**
 * Todas las casillas a `false`. Es el punto de partida del formulario: marcar es un
 * acto explícito del operador, y una casilla premarcada se firma sin mirar.
 */
export function emptyChecklist(): ConditionChecklist {
  return Object.fromEntries(CONDITION_CHECKLIST_IDS.map((id) => [id, false])) as ConditionChecklist;
}
