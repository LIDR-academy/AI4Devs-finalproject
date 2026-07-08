import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/prisma/client';

export const purchaseProcessesRouter = Router();

const createSchema = z.object({
  propertyPrice: z.number().nonnegative().optional(),
  analyzedListingId: z.string().uuid().optional(),
  financialProfile: z
    .object({
      savings: z.number().nonnegative(),
      monthlyIncome: z.number().nonnegative(),
      existingDebts: z.number().nonnegative(),
      region: z.string().min(2),
      persona: z.enum(['conservador', 'equilibrado', 'arriesgado']).optional(),
    })
    .optional(),
});

const updateSchema = createSchema.partial().extend({
  currentStage: z
    .enum(['PRE_ARRAS', 'ARRAS', 'DUE_DILIGENCE', 'PRE_ESCRITURA', 'ESCRITURA', 'POST_ESCRITURA'])
    .optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ABANDONED']).optional(),
});

purchaseProcessesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const processes = await prisma.purchaseProcess.findMany({
      where: { userId: req.userId, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(processes);
  } catch (err) {
    next(err);
  }
});

purchaseProcessesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createSchema.parse(req.body);

    let propertyPrice = body.propertyPrice;
    const sourceListingId = body.analyzedListingId ?? null;

    if (body.analyzedListingId) {
      const listing = await prisma.analyzedListing.findUnique({
        where: { id: body.analyzedListingId },
      });
      if (listing) {
        propertyPrice = listing.transparencyScore > 0 ? body.propertyPrice : undefined;
      }
    }

    const process = await prisma.purchaseProcess.create({
      data: {
        userId: req.userId!,
        propertyPrice: propertyPrice ?? null,
        sourceListingId,
        financialProfile: body.financialProfile ?? undefined,
      },
    });
    res.status(201).json(process);
  } catch (err) {
    next(err);
  }
});

purchaseProcessesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const process = await prisma.purchaseProcess.findFirst({
      where: { id, userId: req.userId },
    });
    if (!process) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    res.json(process);
  } catch (err) {
    next(err);
  }
});

purchaseProcessesRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const body = updateSchema.parse(req.body);

    const result = await prisma.purchaseProcess.updateMany({
      where: { id, userId: req.userId! },
      data: body,
    });

    if (result.count === 0) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }

    const process = await prisma.purchaseProcess.findUnique({ where: { id } });
    res.json(process);
  } catch (err) {
    next(err);
  }
});
