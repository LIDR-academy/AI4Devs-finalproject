import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
