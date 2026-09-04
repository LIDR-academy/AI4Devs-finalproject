import { DomainError } from '../../errors/DomainError.js';

/**
 * US-026 / Invariante 5: un área de cocina (`StorageLocation type = KITCHEN`)
 * referenciada por al menos un `Remanente` en estado `ACTIVE` no puede eliminarse
 * ni desactivarse.
 */
export class LocationHasRemanentesException extends DomainError {
  constructor(locationName: string) {
    super(
      `El área "${locationName}" tiene ingredientes abiertos (remanentes activos) y no puede eliminarse ni desactivarse. Ciérrelos primero.`,
      409
    );
  }
}
