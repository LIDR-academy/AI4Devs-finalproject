import { Request, Response, NextFunction } from 'express';
import { sessionMiddleware } from './session';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function makeMocks(cookieSessionId?: string): {
  req: Partial<Request>;
  res: Partial<Response> & { locals: Record<string, unknown> };
  next: jest.Mock;
} {
  const req: Partial<Request> = {
    cookies: cookieSessionId ? { sessionId: cookieSessionId } : {},
  };
  const res: Partial<Response> & { locals: Record<string, unknown> } = {
    locals: {},
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('sessionMiddleware', () => {
  it('genera nuevo sessionId cuando no hay cookie', () => {
    const { req, res, next } = makeMocks();

    sessionMiddleware(req as Request, res as Response, next as NextFunction);

    expect(req.sessionId).toBeDefined();
    expect(UUID_V4_REGEX.test(req.sessionId as string)).toBe(true);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('reutiliza sessionId existente y válido', () => {
    const existingId = 'a3bb189e-8bf9-4888-9912-ace4e6543002';
    const { req, res, next } = makeMocks(existingId);

    sessionMiddleware(req as Request, res as Response, next as NextFunction);

    expect(req.sessionId).toBe(existingId);
    expect(res.locals['newSessionId']).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('regenera sessionId si el valor no es un UUID válido', () => {
    const { req, res, next } = makeMocks('malicious-value');

    sessionMiddleware(req as Request, res as Response, next as NextFunction);

    expect(req.sessionId).toBeDefined();
    expect(UUID_V4_REGEX.test(req.sessionId as string)).toBe(true);
    expect(req.sessionId).not.toBe('malicious-value');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('establece res.locals.newSessionId cuando genera un ID nuevo', () => {
    const { req, res, next } = makeMocks();

    sessionMiddleware(req as Request, res as Response, next as NextFunction);

    expect(res.locals['newSessionId']).toBeDefined();
    expect(res.locals['newSessionId']).toBe(req.sessionId);
  });

  it('no llama Math.random durante la ejecución', () => {
    const mathRandomSpy = jest.spyOn(Math, 'random');
    const { req, res, next } = makeMocks();

    sessionMiddleware(req as Request, res as Response, next as NextFunction);

    expect(mathRandomSpy).not.toHaveBeenCalled();
    mathRandomSpy.mockRestore();
  });
});
