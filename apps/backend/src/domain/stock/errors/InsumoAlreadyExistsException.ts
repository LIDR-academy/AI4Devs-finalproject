import { DomainError } from '../../errors/DomainError.js';

export class InsumoAlreadyExistsException extends DomainError {
  constructor(message = 'Ya existe un insumo registrado con el mismo nombre.') {
    super(message, 409);
  }
}
