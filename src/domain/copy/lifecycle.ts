/**
 * Ciclo de vida de la Copia (D2 / PRD §4.2) — lógica pura, sin Prisma.
 *
 * Aquí solo está lo que necesita la **baja** (tarea 2.3). La tabla completa de
 * transiciones válidas y su validación son la tarea 3.2; los estados sí se declaran
 * ya enteros para que ambas hablen del mismo vocabulario.
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
 * `BAJA` es **terminal**: una copia retirada queda fuera de circulación y no vuelve.
 */
export const TERMINAL_COPY_STATES = ["BAJA"] as const satisfies readonly CopyState[];

export function isTerminalCopyState(state: CopyState): boolean {
  return (TERMINAL_COPY_STATES as readonly CopyState[]).includes(state);
}

/**
 * Se puede retirar desde **cualquier** estado que no sea ya la baja.
 *
 * No es laxitud: las causas de baja son daño irreparable, pérdida y sustracción
 * (`catalog-inventory`, HU-15), y ninguna respeta el flujo feliz — una copia puede
 * perderse mientras está `ALQUILADA`, aparecer rota en `EN_INSPECCION` o dañarse en
 * el almacén estando `DISPONIBLE`. Lo único que carece de sentido es dar de baja lo
 * que ya está de baja.
 */
export function canRetire(state: CopyState): boolean {
  return !isTerminalCopyState(state);
}
