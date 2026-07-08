import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/prisma/client';

export const checklistRouter = Router();

/**
 * GET /api/checklist — current process's checklist (US6)
 * POST /api/checklist/:processId — create default checklist for a process
 * PATCH /api/checklist/items/:id — toggle item completed
 */
checklistRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const process = await prisma.purchaseProcess.findFirst({
      where: { userId: req.userId, status: 'ACTIVE' },
      include: {
        checklists: { include: { items: { orderBy: { sortOrder: 'asc' } } }, take: 1 },
      },
    });
    if (!process || process.checklists.length === 0) {
      res.status(404).json({ error: 'NO_CHECKLIST' });
      return;
    }
    res.json(process.checklists[0]);
  } catch (err) {
    next(err);
  }
});

checklistRouter.post('/process/:processId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const processId = z.string().uuid().parse(req.params.processId);
    const { CHECKLIST_TEMPLATE } = await import('../../infrastructure/prisma/seed');

    const checklist = await prisma.checklist.create({
      data: {
        processId,
        items: {
          create: CHECKLIST_TEMPLATE.flatMap((stage) =>
            stage.items.map((item) => ({
              stage: stage.stage,
              title: item.title,
              description: item.title,
              documentsNeeded: [],
              estimatedDays: item.estimatedDays,
              sortOrder: item.sortOrder,
            })),
          ),
        },
      },
      include: { items: true },
    });
    res.status(201).json(checklist);
  } catch (err) {
    next(err);
  }
});

checklistRouter.patch('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { completed } = z.object({ completed: z.boolean() }).parse(req.body);
    const item = await prisma.checklistItem.update({
      where: { id },
      data: { completed, completedAt: completed ? new Date() : null },
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
});
