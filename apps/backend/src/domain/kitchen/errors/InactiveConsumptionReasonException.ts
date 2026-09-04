import { DomainError } from '../../errors/DomainError.js';

/**
 * ADR-004 / US-004 / TK-108: el `reasonId` referencia un motivo que existe pero
 * fue desactivado (`ConsumptionReason.isActive = false`) — no se puede elegir
 * a partir de ahora, aunque se conserva para las referencias históricas ya
 * registradas. HTTP 400 (distinto de `EntityNotFoundException`, que es 404
 * para un `reasonId` que no existe en absoluto).
 */
export class InactiveConsumptionReasonException extends DomainError {
  constructor(reasonId: string) {
    super(`El motivo de consumo con ID ${reasonId} está desactivado y no puede utilizarse.`, 400);
  }
}
