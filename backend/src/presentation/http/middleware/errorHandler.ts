import type { ErrorRequestHandler } from 'express'
import {
  ConflictError,
  NotFoundError,
  UnprocessableError,
  ValidationError,
} from '../../../domain/errors/appErrors'

const INTERNAL_ERROR_MESSAGE = 'Error interno del servidor'

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

function getStatusCode(err: unknown): number {
  if (err instanceof ValidationError) return 400
  if (err instanceof NotFoundError) return 404
  if (err instanceof ConflictError) return 409
  if (err instanceof UnprocessableError) return 422
  return 500
}

function buildErrorBody(err: unknown): {
  code: string
  message: string
  details?: unknown
  stack?: string
} {
  const production = isProduction()

  if (
    err instanceof ValidationError ||
    err instanceof NotFoundError ||
    err instanceof ConflictError ||
    err instanceof UnprocessableError
  ) {
    const body: {
      code: string
      message: string
      details?: unknown
      stack?: string
    } = {
      code: err.code,
      message: err.message,
    }

    if (err.details !== undefined) {
      body.details = err.details
    }

    if (!production && err.stack) {
      body.stack = err.stack
    }

    return body
  }

  const body: {
    code: string
    message: string
    stack?: string
  } = {
    code: 'INTERNAL_ERROR',
    message: INTERNAL_ERROR_MESSAGE,
  }

  if (!production && err instanceof Error && err.stack) {
    body.stack = err.stack
  }

  return body
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  void next
  const status = getStatusCode(err)
  const body = buildErrorBody(err)

  console.error(`[errorHandler] ${req.method} ${req.path}`, err)

  res.status(status).json(body)
}
