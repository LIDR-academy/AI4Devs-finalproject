import { InvariantViolationError } from "@/domain/errors";

/**
 * Ciclo de vida de la Copia — lógica pura, sin Prisma (D2 / PRD §15.5).
 *
 * La tabla de abajo es la **fuente única de verdad** de qué transiciones existen. La
 * spec es explícita: *"el sistema SHALL rechazar cualquier transición no contemplada
 * en el ciclo de vida"*, así que lo que no está aquí, no ocurre.
 */

export const COPY_STATES = [
  "INTAKE",
  "DISPONIBLE",
  "OFRECIDA",
  "ALQUILADA",
  "EN_DEVOLUCION",
  "EN_INSPECCION",
  "EN_HIGIENIZACION",
  "INCOMPLETA",
  "BAJA",
] as const;

export type CopyState = (typeof COPY_STATES)[number];

/**
 * Quién puede provocar cada transición.
 *
 *  - `operator`: la ejecuta una persona desde el back-office.
 *  - `system`: la provocan los flujos de alquiler y cola (bloques 5 y 6), no un botón.
 *    Exponerlas en el endpoint de back-office dejaría mover una copia a `ALQUILADA`
 *    sin que exista el alquiler correspondiente.
 */
export type TransitionDriver = "operator" | "system";

export interface CopyTransition {
  from: CopyState;
  to: CopyState;
  /** Motivo de dominio, tal como lo nombra PRD §15.5. */
  label: string;
  driver: TransitionDriver;
  /**
   * Permiso necesario cuando la ejecuta una persona. `null` en las de sistema, que
   * no se atienden desde el back-office.
   */
  permission: "copy.advance_lifecycle" | "incident.mark" | "copy.retire" | null;
}

/** Tabla canónica de PRD §15.5, literal. */
export const COPY_TRANSITIONS: readonly CopyTransition[] = [
  { from: "INTAKE", to: "DISPONIBLE", label: "catalogada (alta)", driver: "operator", permission: "copy.advance_lifecycle" },

  // Cola y alquiler: las mueve el sistema al ofrecer, aceptar o caducar (bloques 5-6).
  { from: "DISPONIBLE", to: "OFRECIDA", label: "ofrecida a la cola", driver: "system", permission: null },
  { from: "OFRECIDA", to: "DISPONIBLE", label: "oferta rechazada o caducada", driver: "system", permission: null },
  { from: "OFRECIDA", to: "ALQUILADA", label: "oferta aceptada", driver: "system", permission: null },
  { from: "DISPONIBLE", to: "ALQUILADA", label: "asignación directa", driver: "system", permission: null },
  { from: "ALQUILADA", to: "EN_DEVOLUCION", label: "el suscriptor inicia la devolución", driver: "system", permission: null },

  // Retorno: el operador recepciona, inspecciona e higieniza.
  { from: "EN_DEVOLUCION", to: "EN_INSPECCION", label: "recepcionada por el operador", driver: "operator", permission: "copy.advance_lifecycle" },
  { from: "EN_INSPECCION", to: "EN_HIGIENIZACION", label: "inspección correcta", driver: "operator", permission: "copy.advance_lifecycle" },
  { from: "EN_INSPECCION", to: "INCOMPLETA", label: "faltan piezas", driver: "operator", permission: "incident.mark" },
  { from: "INCOMPLETA", to: "EN_HIGIENIZACION", label: "piezas repuestas", driver: "operator", permission: "copy.advance_lifecycle" },
  { from: "EN_HIGIENIZACION", to: "DISPONIBLE", label: "vuelve a circulación", driver: "operator", permission: "copy.advance_lifecycle" },

  // Bajas: siempre de admin (D6).
  { from: "EN_INSPECCION", to: "BAJA", label: "daño irreparable", driver: "operator", permission: "copy.retire" },
  { from: "INCOMPLETA", to: "BAJA", label: "no reparable", driver: "operator", permission: "copy.retire" },
  { from: "ALQUILADA", to: "BAJA", label: "pérdida o sustracción en préstamo", driver: "operator", permission: "copy.retire" },
];

/** `BAJA` es terminal: una copia retirada queda fuera de circulación y no vuelve. */
export const TERMINAL_COPY_STATES = ["BAJA"] as const satisfies readonly CopyState[];

export function isTerminalCopyState(state: CopyState): boolean {
  return (TERMINAL_COPY_STATES as readonly CopyState[]).includes(state);
}

export function findTransition(from: CopyState, to: CopyState): CopyTransition | undefined {
  return COPY_TRANSITIONS.find((t) => t.from === from && t.to === to);
}

export function canTransition(from: CopyState, to: CopyState): boolean {
  return findTransition(from, to) !== undefined;
}

/** Estados alcanzables desde uno dado. Alimenta la cola de trabajo del back-office. */
export function nextStates(from: CopyState): readonly CopyState[] {
  return COPY_TRANSITIONS.filter((t) => t.from === from).map((t) => t.to);
}

/**
 * Estados desde los que se puede dar de baja una copia.
 *
 * **No es "cualquiera salvo BAJA"**: la tabla de PRD §15.5 solo contempla la baja
 * desde `EN_INSPECCION` (daño irreparable), `INCOMPLETA` (no reparable) y `ALQUILADA`
 * (pérdida o sustracción). Una copia `DISPONIBLE` que aparece rota se marca primero
 * por el camino de inspección; retirarla de golpe se saltaría el registro de por qué.
 */
export function canRetireFrom(state: CopyState): boolean {
  return canTransition(state, "BAJA");
}

/**
 * Comprueba una transición y lanza el error de dominio si no existe.
 *
 * `COPY_STATE_CONFLICT` (409) y no un 422: el problema no es que la petición esté mal
 * formada, sino que **choca con el estado actual** del recurso — y la misma petición
 * podría ser válida un minuto antes o después.
 */
export function assertTransition(from: CopyState, to: CopyState): CopyTransition {
  const transition = findTransition(from, to);
  if (!transition) {
    throw new InvariantViolationError(
      "COPY_STATE_CONFLICT",
      `Una copia en ${from} no puede pasar a ${to}.`
    );
  }
  return transition;
}
