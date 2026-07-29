import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface RequestWithUser extends Request {
  user: { userId: string; email: string };
}
