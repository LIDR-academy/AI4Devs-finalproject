import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../infrastructure/prisma/client';

export const adminPortalHealthRouter = Router();

/**
 * GET /api/admin/portal-health (FR-027)
 * Returns the health status of all monitored portals.
 * No auth in MVP (TODO: add auth in production).
 */
adminPortalHealthRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const portals = await prisma.portalHealthCheck.findMany({
      orderBy: { domain: 'asc' },
    });
    res.json({ portals });
  } catch (err) {
    next(err);
  }
});
