import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/SessionService';

export const SessionController = {
  async createDaily(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await SessionService.createDailySession(req.user.uid, req.body);
      res.status(201).json({ session });
    } catch (err) {
      next(err);
    }
  },

  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { session, streak } = await SessionService.completeSession(
        req.user.uid,
        req.params.sessionId,
        req.body
      );
      res.json({ session, streak });
    } catch (err) {
      next(err);
    }
  },
};
