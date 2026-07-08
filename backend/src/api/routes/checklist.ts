import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/prisma/client';
import { ChecklistRepository } from '../../infrastructure/repositories/ChecklistRepository';

export const checklistRouter = Router();

const checklistRepo = new ChecklistRepository(prisma);

/**
 * GET /api/checklist — current process's checklist (US6)
 * Auto-creates a default checklist on first access (FR-024).
 * PATCH /api/checklist/items/:id — toggle item completed
 */
checklistRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const process = await prisma.purchaseProcess.findFirst({
      where: { userId: req.userId, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
    });
    if (!process) {
      res.status(404).json({ error: 'NO_ACTIVE_PROCESS' });
      return;
    }
    const checklist = await checklistRepo.ensureForProcess(process.id);
    res.json(checklist);
  } catch (err) {
    next(err);
  }
});

checklistRouter.get('/process/:processId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const processId = z.string().uuid().parse(req.params.processId);
    const checklist = await checklistRepo.findByProcessId(processId);
    if (!checklist) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    res.json(checklist);
  } catch (err) {
    next(err);
  }
});

checklistRouter.patch('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { completed } = z.object({ completed: z.boolean() }).parse(req.body);
    const item = await checklistRepo.toggleItem(id, completed);
    if (!item) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});
