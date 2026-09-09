import { DomainError } from '../../errors/DomainError.js';

/**
 * US-028 / ADR-003: `close` y `abandon` solo operan sobre una `RecipePreparation`
 * en estado `OPEN`. Un segundo cierre (o cerrar una ya abandonada) es un conflicto
 * de estado. HTTP 409.
 */
export class PreparationNotOpenException extends DomainError {
  constructor(id: string, status: string) {
    super(`La preparación ${id} no está abierta (estado actual: ${status}).`, 409);
  }
}
