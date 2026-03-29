export class PinNotFoundError extends Error {
  constructor(pinId?: string) {
    super(pinId ? `Pin with id ${pinId} not found` : 'Pin not found');
    this.name = 'PinNotFoundError';
  }
}

export class InvalidPinCoordinatesError extends Error {
  constructor(message: string = 'Pin coordinates must be between 0 and 1') {
    super(message);
    this.name = 'InvalidPinCoordinatesError';
  }
}

export class PinDeletionForbiddenError extends Error {
  constructor() {
    super('Only the creator can delete this pin');
    this.name = 'PinDeletionForbiddenError';
  }
}

export class PinStatusUpdateForbiddenError extends Error {
  constructor() {
    super('Guest users cannot update pin status');
    this.name = 'PinStatusUpdateForbiddenError';
  }
}
