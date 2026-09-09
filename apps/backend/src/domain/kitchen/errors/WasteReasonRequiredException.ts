import { DomainError } from '../../errors/DomainError.js';

/**
 * US-028 / ADR-003: si `wastedQty > 0` para un ingrediente al cerrar la preparación,
 * `wasteReason` es obligatorio (trazabilidad de inocuidad — cada merma con su motivo).
 * HTTP 400.
 */
export class WasteReasonRequiredException extends DomainError {
  constructor(insumoId: string) {
    super(`Debe indicar el motivo de la merma del insumo ${insumoId}.`, 400);
  }
}
