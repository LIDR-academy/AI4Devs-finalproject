import { DomainError } from '../../errors/DomainError.js';

/**
 * AUDIT-DEV-006 F-4: descarte directo desde bodega (`purpose = 'DIRECT_DISCARD'`) sin
 * un motivo descriptivo. Excepción de dominio (400) — reemplaza el `throw new Error(...)`
 * crudo que `errorHandler` no sabía mapear a RFC 7807. La frontera Zod del controlador
 * sigue rechazando la misma condición como `ValidationError`; esta excepción cubre a
 * cualquier otro consumidor del caso de uso.
 */
export class DiscardReasonRequiredException extends DomainError {
  constructor() {
    super('El motivo es obligatorio para descarte directo desde bodega.', 400);
  }
}
