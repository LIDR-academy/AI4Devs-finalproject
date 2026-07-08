import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { prisma } from '../../infrastructure/prisma/client';

export const SESSION_HEADER = 'x-session-id';
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      userId?: string;
    }
  }
}

/**
 * Session middleware (T014). Generates or validates the X-Session-Id header.
 * Lazily creates a User record on first contact.
 */
export async function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.header(SESSION_HEADER);
    let sessionId: string | null = null;

    if (header && uuidValidate(header) && UUID_V4_REGEX.test(header)) {
      sessionId = header;
    }

    if (!sessionId) {
      sessionId = uuidv4();
      res.setHeader(SESSION_HEADER, sessionId);
    }

    req.sessionId = sessionId;

    const user = await prisma.user.upsert({
      where: { sessionId },
      update: {},
      create: { sessionId },
    });

    req.userId = user.id;
    next();
  } catch (err) {
    next(err);
  }
}
