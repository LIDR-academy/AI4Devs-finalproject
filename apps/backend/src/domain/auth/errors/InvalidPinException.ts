import { DomainError } from '../../errors/DomainError.js';

export class InvalidPinException extends DomainError {
  constructor(message: string = 'PIN de acceso invalido o incorrecto.') {
    super(message, 401);
  }
}
