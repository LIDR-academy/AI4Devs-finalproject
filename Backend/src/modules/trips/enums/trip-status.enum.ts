/**
 * Enum que representa los estados posibles de un viaje.
 */
export enum TripStatus {
  /**
   * Viaje activo, permite agregar gastos y participantes.
   */
  ACTIVE = 'ACTIVE',

  /**
   * Viaje cerrado, no permite agregar nuevos gastos.
   */
  CLOSED = 'CLOSED',
}
