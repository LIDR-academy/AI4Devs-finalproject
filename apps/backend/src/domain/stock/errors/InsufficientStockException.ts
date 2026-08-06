import { DomainError } from '../../errors/DomainError.js';

export class InsufficientStockException extends DomainError {
  constructor(insumoName: string, requested: string, available: string) {
    super(
      `Stock insuficiente para el insumo ${insumoName}. Solicitado: ${requested}, Disponible: ${available}.`,
      422
    );
  }
}
