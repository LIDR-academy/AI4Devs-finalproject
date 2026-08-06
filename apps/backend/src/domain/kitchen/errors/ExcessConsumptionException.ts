import { DomainError } from '../../errors/DomainError.js';

export class ExcessConsumptionException extends DomainError {
  constructor(requested: string, available: string) {
    super(
      `No es posible consumir ${requested}. La cantidad disponible en el remanente es de ${available}.`,
      422
    );
  }
}
