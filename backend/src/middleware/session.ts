import { Request, Response, NextFunction } from 'express';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuidV4(value: unknown): value is string {
  return typeof value === 'string' && UUID_V4_REGEX.test(value);
}

// La cookie sessionId no está firmada (sin HMAC ni SESSION_SECRET). La seguridad se
// garantiza por entropía: crypto.randomUUID() produce 122 bits de aleatoriedad, lo
// que hace la predicción o fuerza bruta inviable. Si en el futuro se necesita firma
// (p. ej. migrar a express-session), añadir SESSION_SECRET a .env.example entonces.
export function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const cookieValue: unknown = req.cookies?.sessionId;

  if (isValidUuidV4(cookieValue)) {
    req.sessionId = cookieValue;
  } else {
    const newId = crypto.randomUUID();
    req.sessionId = newId;
    res.locals['newSessionId'] = newId;
  }

  next();
}
