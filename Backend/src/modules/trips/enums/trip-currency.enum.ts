/**
 * Enum that represents the supported currencies for trips.
 * Currently supports Colombian Peso (COP) and US Dollar (USD).
 */
export enum TripCurrency {
  /**
   * Colombian Peso.
   * Default currency for trips.
   */
  COP = 'COP',

  /**
   * US Dollar.
   * Alternative currency for international trips.
   */
  USD = 'USD',
}
