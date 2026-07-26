import { Request, Response, NextFunction } from 'express';
import { StreakService } from '../services/StreakService';

export const StreakController = {
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const streak = await StreakService.getStreak(req.user.uid);
      res.json({ streak });
    } catch (err) {
      next(err);
    }
  },
};
