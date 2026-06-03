import type { NextFunction, Request, Response } from 'express'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ConflictError,
  NotFoundError,
  UnprocessableError,
  ValidationError,
} from '../../../domain/errors/appErrors'
import { errorHandler } from './errorHandler'

function createMockResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response & {
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
  }

  return res
}

function invokeHandler(err: unknown, nodeEnv?: string) {
  const previousEnv = process.env.NODE_ENV

  if (nodeEnv !== undefined) {
    process.env.NODE_ENV = nodeEnv
  }

  const req = { method: 'GET', path: '/test' } as Request
  const res = createMockResponse()
  const next = vi.fn() as NextFunction

  errorHandler(err, req, res, next)

  if (nodeEnv !== undefined) {
    process.env.NODE_ENV = previousEnv
  }

  return { res, next }
}

describe('errorHandler', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('typed errors — happy path', () => {
    it('maps ValidationError to 400 with details', () => {
      const details = [{ field: 'name', message: 'El nombre es obligatorio' }]
      const err = new ValidationError('Datos inválidos', details)
      const { res } = invokeHandler(err, 'test')

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        code: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
        details,
        stack: err.stack,
      })
    })

    it('maps NotFoundError to 404', () => {
      const err = new NotFoundError('Usuario no encontrado')
      const { res } = invokeHandler(err, 'test')

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
        stack: err.stack,
      })
    })

    it('maps ConflictError to 409', () => {
      const err = new ConflictError('El recurso ya existe')
      const { res } = invokeHandler(err, 'test')

      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.json).toHaveBeenCalledWith({
        code: 'CONFLICT',
        message: 'El recurso ya existe',
        stack: err.stack,
      })
    })

    it('maps UnprocessableError to 422', () => {
      const err = new UnprocessableError(
        'Puntos insuficientes para canjear',
        'INSUFFICIENT_POINTS'
      )
      const { res } = invokeHandler(err, 'test')

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith({
        code: 'INSUFFICIENT_POINTS',
        message: 'Puntos insuficientes para canjear',
        stack: err.stack,
      })
    })
  })

  describe('generic errors — edge cases', () => {
    it('maps generic Error to 500 INTERNAL_ERROR in development', () => {
      const err = new Error('connection refused')
      const { res } = invokeHandler(err, 'development')

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor',
        stack: err.stack,
      })
    })

    it('hides stack and original message in production', () => {
      const err = new Error('connection refused')
      const { res } = invokeHandler(err, 'production')

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor',
      })
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({ stack: expect.any(String) })
      )
    })

    it('omits stack for typed errors in production', () => {
      const err = new ValidationError('Datos inválidos')
      const { res } = invokeHandler(err, 'production')

      expect(res.status).toHaveBeenCalledWith(400)
      const body = res.json.mock.calls[0][0] as Record<string, unknown>
      expect(body).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
      })
      expect(body).not.toHaveProperty('stack')
    })
  })

  describe('response format', () => {
    it('serializes code and message as strings without legacy error field', () => {
      const err = new NotFoundError('Recurso no encontrado')
      const { res } = invokeHandler(err, 'test')

      const body = res.json.mock.calls[0][0] as Record<string, unknown>
      expect(typeof body.code).toBe('string')
      expect(typeof body.message).toBe('string')
      expect(body).not.toHaveProperty('error')
    })
  })
})
