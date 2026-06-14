export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class StockError extends Error {
  constructor(
    public available: number,
    message = 'Insufficient stock',
  ) {
    super(message);
    this.name = 'StockError';
  }
}

export class ValidationError extends Error {
  constructor(message = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}
