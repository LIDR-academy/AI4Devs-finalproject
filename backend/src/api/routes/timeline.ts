import { Router, Request, Response, NextFunction } from 'express';
import { getTimeline } from '../../domain/services/TimelineService';

export const timelineRouter = Router();

/**
 * GET /api/timeline (US5)
 * Returns the 60-90 day home-buying timeline (arras → escritura).
 */
timelineRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const timeline = getTimeline();
    res.json({ milestones: timeline });
  } catch (err) {
    next(err);
  }
});
