import { DomainError } from '../../errors/DomainError.js';

export class UserBlockedException extends DomainError {
  constructor(userName: string) {
    super(`El usuario ${userName} ha sido bloqueado por superar el limite de intentos fallidos.`, 403);
  }
}
