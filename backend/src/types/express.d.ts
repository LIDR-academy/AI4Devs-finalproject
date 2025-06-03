import { Request } from 'express';
import { Schema } from 'mongoose';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

export {}; 