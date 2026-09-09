import { DomainError } from './DomainError.js';

export class EntityNotFoundException extends DomainError {
  constructor(entityName: string, id: string | number) {
    super(`${entityName} con ID ${id} no fue encontrado.`, 404);
  }
}
