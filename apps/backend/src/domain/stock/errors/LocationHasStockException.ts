import { DomainError } from '../../errors/DomainError.js';

/**
 * US-025 / Invariante 1-bis: un sub-sector de bodega referenciado por al menos
 * una línea de stock con saldo `> 0` no puede eliminarse ni desactivarse.
 */
export class LocationHasStockException extends DomainError {
  constructor(locationName: string) {
    super(
      `El sector "${locationName}" tiene existencias asociadas y no puede eliminarse ni desactivarse. Vacíelo primero.`,
      409
    );
  }
}
