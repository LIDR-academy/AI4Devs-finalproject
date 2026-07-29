import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/prisma/client';
import { buildComputedFor } from '../lib/attachComputed';

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
      interestRate: z.number().min(0).max(1).optional(),
      isFirstHome: z.boolean().optional(),
      buyerAge: z.number().min(18).max(120).nullable().optional(),
      isProtectedHousing: z.boolean().optional(),
    })
    .passthrough()
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

    const propertyPrice = body.propertyPrice;
    const sourceListingId = body.analyzedListingId ?? null;

    if (body.analyzedListingId) {
      const listing = await prisma.analyzedListing.findUnique({
        where: { id: body.analyzedListingId },
      });
      if (!listing) {
        res.status(400).json({ error: 'LISTING_NOT_FOUND' });
        return;
      }
    }

    const process = await prisma.purchaseProcess.create({
      data: {
        userId: req.userId!,
        propertyPrice: propertyPrice ?? null,
        sourceListingId,
        financialProfile: (body.financialProfile as Record<string, unknown>) ?? undefined,
      },
    } as never);
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
    const computed = buildComputedFor(process);
    res.json({ ...process, computed });
  } catch (err) {
    next(err);
  }
});

purchaseProcessesRouter.delete('/active', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.purchaseProcess.deleteMany({
      where: { userId: req.userId, status: 'ACTIVE' },
    });
    res.status(200).json({ ok: true });
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
      data: body as Record<string, unknown>,
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
