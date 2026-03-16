import { Product } from '../entities/Product';
import { DomainEvent } from './DomainEvent';

export class ProductCreatedEvent implements DomainEvent {
  constructor(public readonly product: Product) {}

  get name(): string {
    return 'product.created';
  }
}

export class ProductUpdatedEvent implements DomainEvent {
  constructor(public readonly product: Product) {}

  get name(): string {
    return 'product.updated';
  }
}

export class ProductDeletedEvent implements DomainEvent {
  constructor(public readonly productId: string) {}

  get name(): string {
    return 'product.deleted';
  }
} 