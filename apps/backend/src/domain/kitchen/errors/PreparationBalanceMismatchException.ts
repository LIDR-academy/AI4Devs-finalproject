import { DomainError } from '../../errors/DomainError.js';

/**
 * US-028 / ADR-003 #9: al cerrar una preparación, por cada ingrediente debe cuadrar
 * exacto `extraído = consumido + sobrante + merma` (aritmética Decimal, Guard 17).
 * Se lanza cuando `sobrante + merma` supera lo que queda en el remanente extraído
 * (consumo derivado negativo). HTTP 400 — el operario declaró cantidades imposibles.
 */
export class PreparationBalanceMismatchException extends DomainError {
  constructor(insumoId: string, extracted: string, leftover: string, wasted: string) {
    super(
      `El cierre no cuadra para el insumo ${insumoId}: sobrante (${leftover}) + merma (${wasted}) ` +
        `supera lo extraído para la preparación (${extracted}).`,
      400
    );
  }
}
