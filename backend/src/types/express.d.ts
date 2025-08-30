import { IUser } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};
