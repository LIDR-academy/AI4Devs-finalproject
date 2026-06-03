export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    details?: Array<{ field: string; message: string }>
  ) {
    super('VALIDATION_ERROR', message, details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code = 'USER_NOT_FOUND', details?: unknown) {
    super(code, message, details)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT', details?: unknown) {
    super(code, message, details)
    this.name = 'ConflictError'
  }
}

export class UnprocessableError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super(code, message, details)
    this.name = 'UnprocessableError'
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError
}
