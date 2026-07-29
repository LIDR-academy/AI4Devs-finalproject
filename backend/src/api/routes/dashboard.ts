import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../infrastructure/prisma/client';
import { buildComputedFor } from '../lib/attachComputed';

export const dashboardRouter = Router();

/**
 * GET /api/dashboard (FR-023)
 * Returns the aggregate view of the active process in a single call.
 */
dashboardRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const process = await prisma.purchaseProcess.findFirst({
      where: { userId: req.userId, status: 'ACTIVE' },
      include: {
        analyzedListings: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { redFlags: true },
        },
        checklists: {
          include: { items: true },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!process) {
      res.json({
        empty: true,
        computed: null,
        ctas: [
          { label: 'Analizar un anuncio', href: '/listing-lens' },
          { label: 'Configurar perfil manualmente', href: '/mortgage-compass' },
        ],
      });
      return;
    }

    const latestListing = process.analyzedListings[0] ?? null;
    const checklist = process.checklists[0] ?? null;
    const completedItems = checklist?.items.filter((i) => i.completed).length ?? 0;
    const totalItems = checklist?.items.length ?? 0;
    const checklistProgress = totalItems > 0 ? completedItems / totalItems : 0;

    const computed = buildComputedFor(process);

    res.json({
      empty: false,
      process: {
        id: process.id,
        status: process.status,
        currentStage: process.currentStage,
        propertyPrice: process.propertyPrice,
        financialProfile: process.financialProfile,
        updatedAt: process.updatedAt,
      },
      computed,
      latestListing: latestListing
        ? {
            id: latestListing.id,
            url: latestListing.url,
            transparencyScore: latestListing.transparencyScore,
            scoreLabel: latestListing.scoreLabel,
            redFlagsCount: latestListing.redFlags.length,
            diff: latestListing.diff,
            createdAt: latestListing.createdAt,
          }
        : null,
      checklist: checklist
        ? {
            id: checklist.id,
            progress: checklistProgress,
            completedItems,
            totalItems,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});
