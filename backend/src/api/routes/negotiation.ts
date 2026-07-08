import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/prisma/client';
import { generateNegotiationPoints } from '../../domain/services/NegotiationPointsService';

export const negotiationRouter = Router();

/**
 * GET /api/listings/:id/negotiation-points (FR-026)
 * Returns 5-8 negotiation points based on red flags + listing data.
 * Generated from hardcoded templates, NOT from LLM (per FR-013).
 */
negotiationRouter.get('/:id/negotiation-points', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const listing = await prisma.analyzedListing.findFirst({
      where: { id, process: { userId: req.userId } },
      include: { redFlags: true },
    });

    if (!listing) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }

    const points = generateNegotiationPoints({
      url: listing.url,
      declaredAddress: listing.declaredAddress,
      transparencyScore: listing.transparencyScore,
      redFlags: listing.redFlags.map((f) => ({ flag: f.flag, severity: f.severity, reasoning: f.reasoning })),
      createdAt: listing.createdAt,
    });

    res.json({ points });
  } catch (err) {
    next(err);
  }
});
