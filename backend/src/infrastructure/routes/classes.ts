import { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { container } from "../../config/container.js";
import { ValidationError } from "../errors.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

const availableSlotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be ISO format (YYYY-MM-DD)"),
  coachId: z.string().uuid("coachId must be a valid UUID"),
  classType: z.enum(["INDIVIDUAL", "GROUP"], {
    errorMap: () => ({ message: "classType must be INDIVIDUAL or GROUP" }),
  }),
});

router.get("/classes", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const classes = await container.listTrainingClasses.execute();
    res.json({ data: classes, meta: { total: classes.length } });
  } catch (error) {
    next(error);
  }
});

router.post("/classes", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!container.createTrainingClass) {
      res.status(503).json({
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Calendar service is not configured",
          ref: crypto.randomUUID(),
        },
      });
      return;
    }
    const trainingClass = await container.createTrainingClass.execute({
      classType: req.body.class_type,
      assignedCoachId: req.body.assigned_coach_id as string,
      levelId: req.body.level_id as string | undefined,
      startTime: new Date(req.body.start_time as string),
      description: req.body.description as string | undefined,
      recurrenceSeriesId: req.body.recurrence_series_id as string | undefined,
      createdBy: req.user?.id ?? (req.body.created_by as string),
    });
    res.status(201).json(trainingClass);
  } catch (error) {
    next(error);
  }
});

router.get("/classes/:id", async (req: Request, res: Response, next: NextFunction) => {
  const classId = req.params.id as string;
  try {
    const trainingClass = await container.prisma.trainingClass.findUnique({
      where: { id: classId },
      include: {
        assignedCoach: true,
        level: true,
        enrollments: true,
      },
    });
    if (!trainingClass) {
      res.status(404).json({
        error: { code: "NOT_FOUND", message: "Class not found", ref: crypto.randomUUID() },
      });
      return;
    }
    res.json(trainingClass);
  } catch (error) {
    next(error);
  }
});

router.put("/classes/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!container.updateTrainingClass) {
      res.status(503).json({
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Calendar service is not configured",
          ref: crypto.randomUUID(),
        },
      });
      return;
    }
    const classId = req.params.id as string;
    const trainingClass = await container.updateTrainingClass.execute(classId, {
      classType: req.body.class_type,
      levelId: req.body.level_id,
      startTime: req.body.start_time ? new Date(req.body.start_time) : undefined,
      description: req.body.description,
    });
    res.json(trainingClass);
  } catch (error) {
    next(error);
  }
});

router.delete("/classes/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!container.deleteTrainingClass) {
      res.status(503).json({
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Calendar service is not configured",
          ref: crypto.randomUUID(),
        },
      });
      return;
    }
    const classId = req.params.id as string;
    await container.deleteTrainingClass.execute(classId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.delete("/recurring-series/:id", (_req: Request, res: Response) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "Recurring series deletion is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.post("/classes/:id/enrollment", (_req: Request, res: Response) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "Enrollment management is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.delete("/classes/:id/enrollment", (_req: Request, res: Response) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "Enrollment management is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.get(
  "/classes/available-slots",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = availableSlotsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      if (!container.getAvailableSlots) {
        res.status(503).json({
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "Calendar service is not configured",
            ref: crypto.randomUUID(),
          },
        });
        return;
      }

      const result = await container.getAvailableSlots.execute(parsed.data);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/coachee/dashboard", (_req: Request, res: Response) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "Coachee dashboard is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

export default router;
