import { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { container } from "../../config/container.js";
import { toTrainingClassDTO } from "../dto/trainingClassDto.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const availableSlotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be ISO format (YYYY-MM-DD)"),
  coachId: z.string().uuid("coachId must be a valid UUID"),
  classType: z.enum(["INDIVIDUAL", "GROUP"], {
    errorMap: () => ({ message: "classType must be INDIVIDUAL or GROUP" }),
  }),
});

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be ISO format (YYYY-MM-DD)");

const recurrenceSchema = z
  .object({
    enabled: z.boolean(),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startDate: dateString.optional(),
  })
  .strict();

const createClassSchema = z
  .object({
    classType: z.enum(["INDIVIDUAL", "GROUP"], {
      errorMap: () => ({ message: "classType must be INDIVIDUAL or GROUP" }),
    }),
    assignedCoachId: z.string().uuid("assignedCoachId must be a valid UUID").optional(),
    coacheeIds: z
      .array(z.string().uuid("Each coachee ID must be a valid UUID"))
      .min(1, "At least one coachee is required"),
    levelId: z.string().uuid("levelId must be a valid UUID").nullable().optional(),
    startDateTime: z.string().datetime({ offset: true }),
    description: z
      .string()
      .max(500, "description must be at most 500 characters")
      .nullable()
      .optional(),
    recurrence: recurrenceSchema.optional(),
  })
  .strict();

const updateClassSchema = z
  .object({
    classType: z.enum(["INDIVIDUAL", "GROUP"]).optional(),
    levelId: z.string().uuid().nullable().optional(),
    startDateTime: z.string().datetime({ offset: true }).optional(),
    description: z.string().max(500).nullable().optional(),
  })
  .strict();

router.get(
  "/classes",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const classes = await container.listTrainingClasses.execute();
      res.json({ data: classes.map(toTrainingClassDTO), meta: { total: classes.length } });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/classes",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  validate(createClassSchema),
  async (req: Request, res: Response, next: NextFunction) => {
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
      const result = await container.createTrainingClass.execute({
        classType: req.body.classType,
        coacheeIds: req.body.coacheeIds,
        assignedCoachId: req.body.assignedCoachId,
        levelId: req.body.levelId ?? undefined,
        startDateTime: new Date(req.body.startDateTime),
        description: req.body.description ?? null,
        recurrence: req.body.recurrence,
        createdBy: req.user?.id ?? "",
      });
      res.status(201).json({
        seriesId: result.seriesId,
        recurrence: result.recurrence,
        instances: result.instances.map(toTrainingClassDTO),
      });
    } catch (error) {
      next(error);
    }
  },
);

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

router.get(
  "/classes/assignable-coaches",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const coaches = await container.prisma.user.findMany({
        where: { role: { in: [UserRole.ADMIN, UserRole.COACH] }, status: "ACTIVE" },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
      res.json({ data: coaches });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/classes/:id",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  async (req: Request, res: Response, next: NextFunction) => {
    const classId = req.params.id as string;
    try {
      const trainingClass = await container.prisma.trainingClass.findUnique({
        where: { id: classId },
        include: {
          assignedCoach: true,
          level: true,
          enrollments: { include: { coachee: true } },
          waitingLists: true,
        },
      });
      if (!trainingClass) {
        throw new NotFoundError("Class not found.");
      }
      res.json(toTrainingClassDTO(trainingClass));
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/classes/:id",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  validate(updateClassSchema),
  async (req: Request, res: Response, next: NextFunction) => {
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
        classType: req.body.classType,
        levelId: req.body.levelId,
        startTime: req.body.startDateTime ? new Date(req.body.startDateTime) : undefined,
        description: req.body.description,
      });
      res.json(toTrainingClassDTO(trainingClass));
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/classes/:id",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  async (req: Request, res: Response, next: NextFunction) => {
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
  },
);

router.delete(
  "/recurring-series/:id",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  (_req: Request, res: Response) => {
    res.status(501).json({
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Recurring series deletion is not yet implemented.",
        ref: crypto.randomUUID(),
      },
    });
  },
);

router.post(
  "/classes/:id/enrollment",
  authenticate,
  requireRole(UserRole.COACHEE),
  (_req: Request, res: Response) => {
    res.status(501).json({
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Enrollment management is not yet implemented.",
        ref: crypto.randomUUID(),
      },
    });
  },
);

router.delete(
  "/classes/:id/enrollment",
  authenticate,
  requireRole(UserRole.COACHEE),
  (_req: Request, res: Response) => {
    res.status(501).json({
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Enrollment management is not yet implemented.",
        ref: crypto.randomUUID(),
      },
    });
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
