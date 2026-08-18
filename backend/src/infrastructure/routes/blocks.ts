import { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { container } from "../../config/container.js";
import { toBlockDTO } from "../dto/blockDto.js";
import { ValidationError } from "../errors.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const createBlockSchema = z
  .object({
    blockType: z.enum(["PERSONAL", "GYM_WIDE"], {
      errorMap: () => ({ message: "blockType must be PERSONAL or GYM_WIDE" }),
    }),
    coachId: z.string().uuid("coachId must be a valid UUID").nullable().optional(),
    startDateTime: z.string().datetime({ offset: true }),
    endDateTime: z.string().datetime({ offset: true }),
    description: z
      .string()
      .max(500, "description must be at most 500 characters")
      .nullable()
      .optional(),
  })
  .strict();

const listBlocksQuerySchema = z
  .object({
    start: z.string().datetime({ offset: true }),
    end: z.string().datetime({ offset: true }),
    blockType: z.enum(["PERSONAL", "GYM_WIDE"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

router.get(
  "/blocks",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = listBlocksQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const start = new Date(parsed.data.start);
      const end = new Date(parsed.data.end);
      if (start >= end) {
        throw new ValidationError("start must be before end");
      }

      const result = await container.listBlocks.execute({
        start,
        end,
        blockType: parsed.data.blockType,
        page: parsed.data.page,
        limit: parsed.data.limit,
      });

      res.json({ data: result.data.map(toBlockDTO), meta: result.meta });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/blocks",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  validate(createBlockSchema),
  async (req: Request, res: Response, next: NextFunction) => {
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
        blockType: req.body.blockType,
        coachId: req.body.coachId ?? undefined,
        startTime: new Date(req.body.startDateTime),
        endTime: new Date(req.body.endDateTime),
        description: req.body.description ?? undefined,
        actor: { id: req.user?.id ?? "", role: req.user?.role ?? "COACHEE" },
      });
      res.status(201).json(toBlockDTO(block));
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/blocks/:id",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await container.cancelBlock.execute({
        id: req.params.id as string,
        actor: { id: req.user?.id ?? "", role: req.user?.role ?? "COACHEE" },
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
