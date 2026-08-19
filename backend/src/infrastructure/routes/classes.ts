import { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { container } from "../../config/container.js";
import { toCoacheeDashboardDTO } from "../dto/coacheeDashboardDto.js";
import { toTrainingClassDTO } from "../dto/trainingClassDto.js";
import { toWaitingListListResponse } from "../dto/waitingListDto.js";
import { ValidationError } from "../errors.js";
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

const listClassesQuerySchema = z
  .object({
    start: z.string().datetime({ offset: true }),
    end: z.string().datetime({ offset: true }),
    classType: z
      .enum(["INDIVIDUAL", "GROUP"], {
        errorMap: () => ({ message: "classType must be INDIVIDUAL or GROUP" }),
      })
      .optional(),
    coachId: z.string().uuid("coachId must be a valid UUID").optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  })
  .strict();

const pageLimitQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  })
  .strict();

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

router.get("/classes", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = listClassesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.message);
    }
    const { start, end, classType, coachId, page, limit } = parsed.data;

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate > endDate) {
      throw new ValidationError("start must not be after end.");
    }

    const result = await container.listTrainingClasses.execute({
      start: startDate,
      end: endDate,
      classType,
      coachId,
      page,
      limit,
      viewerRole: req.user?.role ?? "COACHEE",
      viewerId: req.user?.id ?? "",
    });

    res.json({
      data: result.data.map(({ row, visibility }) =>
        toTrainingClassDTO(row, {
          viewerRole: req.user?.role,
          viewerId: req.user?.id,
          visibility,
        }),
      ),
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
});

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
        instances: result.instances.map((trainingClass) => toTrainingClassDTO(trainingClass)),
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
  async (req: Request, res: Response, next: NextFunction) => {
    const classId = req.params.id as string;
    try {
      const result = await container.getTrainingClass.execute({
        id: classId,
        viewerRole: req.user?.role ?? "COACHEE",
        viewerId: req.user?.id ?? "",
      });
      res.json(
        toTrainingClassDTO(result.row, {
          viewerRole: req.user?.role,
          viewerId: req.user?.id,
          coacheeStatus: result.coacheeStatus,
        }),
      );
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

const cancelClassQuerySchema = z
  .object({
    scope: z.enum(["single", "series"]).optional().default("single"),
  })
  .strict();

router.delete(
  "/classes/:id",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = cancelClassQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }
      const classId = req.params.id as string;
      const result = await container.cancelTrainingClass.execute({
        id: classId,
        scope: parsed.data.scope,
        actor: { id: req.user?.id ?? "", role: req.user?.role ?? "COACHEE" },
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/recurring-series/:id",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const seriesId = req.params.id as string;
      const result = await container.cancelRecurringSeries.execute({
        seriesId,
        actor: { id: req.user?.id ?? "", role: req.user?.role ?? "COACHEE" },
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

const classIdParamSchema = z.string().uuid("id must be a valid UUID");

router.post(
  "/classes/:id/enrollment",
  authenticate,
  requireRole(UserRole.COACHEE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = classIdParamSchema.safeParse(req.params.id);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }
      const result = await container.joinTrainingClass.execute({
        classId: parsed.data,
        coacheeId: req.user?.id ?? "",
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/classes/:id/enrollment",
  authenticate,
  requireRole(UserRole.COACHEE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = classIdParamSchema.safeParse(req.params.id);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }
      const result = await container.cancelEnrollment.execute({
        classId: parsed.data,
        coacheeId: req.user?.id ?? "",
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/classes/:id/waiting-list",
  authenticate,
  requireRole(UserRole.COACHEE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = classIdParamSchema.safeParse(req.params.id);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }
      const result = await container.joinWaitingList.execute({
        classId: parsed.data,
        coacheeId: req.user?.id ?? "",
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/classes/:id/waiting-list",
  authenticate,
  requireRole(UserRole.COACHEE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = classIdParamSchema.safeParse(req.params.id);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }
      const result = await container.leaveWaitingList.execute({
        classId: parsed.data,
        coacheeId: req.user?.id ?? "",
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/coachee/dashboard",
  authenticate,
  requireRole(UserRole.COACHEE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await container.getCoacheeDashboard.execute({
        coacheeId: req.user?.id ?? "",
        now: new Date(),
      });
      res.json(toCoacheeDashboardDTO(result));
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/waiting-lists",
  authenticate,
  requireRole(UserRole.COACHEE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedQuery = pageLimitQuerySchema.safeParse(req.query);
      if (!parsedQuery.success) {
        throw new ValidationError(parsedQuery.error.message);
      }
      const result = await container.listWaitingLists.execute({
        coacheeId: req.user?.id ?? "",
        page: parsedQuery.data.page,
        limit: parsedQuery.data.limit,
      });
      res.json(toWaitingListListResponse(result));
    } catch (error) {
      next(error);
    }
  },
);

export default router;
