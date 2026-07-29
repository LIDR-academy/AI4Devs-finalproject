import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { container } from "../../config/container.js";

const router = Router();

router.get("/blocks", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const blocks = await container.listBlocks.execute();
    res.json({ data: blocks, meta: { total: blocks.length } });
  } catch (error) {
    next(error);
  }
});

router.post("/blocks", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!container.createBlock) {
      res.status(503).json({
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Calendar service is not configured",
          ref: crypto.randomUUID(),
        },
      });
      return;
    }
    const block = await container.createBlock.execute({
      blockType: req.body.block_type,
      coachId: req.body.coach_id,
      startTime: new Date(req.body.start_time as string),
      endTime: new Date(req.body.end_time as string),
      description: req.body.description as string | undefined,
      createdBy: req.user?.id ?? (req.body.created_by as string),
    });
    res.status(201).json(block);
  } catch (error) {
    next(error);
  }
});

router.delete("/blocks/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!container.deleteBlock) {
      res.status(503).json({
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Calendar service is not configured",
          ref: crypto.randomUUID(),
        },
      });
      return;
    }
    const blockId = req.params.id as string;
    await container.deleteBlock.execute(blockId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
