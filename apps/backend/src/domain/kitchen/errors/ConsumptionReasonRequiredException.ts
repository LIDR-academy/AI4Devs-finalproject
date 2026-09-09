import { DomainError } from '../../errors/DomainError.js';

/**
 * ADR-004 / US-008 / TK-109: una línea de conciliación de turno con varianza
 * **negativa** (conteo físico < teórico — inventario perdido) exige `reasonId`.
 * Sin él, la operación completa se rechaza antes de mutar cualquier remanente —
 * no es un ajuste silencioso a medias. HTTP 400.
 */
export class ConsumptionReasonRequiredException extends DomainError {
  constructor(remanenteId: string) {
    super(
      `Debe indicar el motivo de la varianza negativa de conciliación del remanente ${remanenteId}.`,
      400
    );
  }
}
