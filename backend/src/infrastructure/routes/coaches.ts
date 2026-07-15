import { UserRole } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { container } from "../../config/container.js";
import { ConflictError, NotFoundError } from "../errors.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const createCoachSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(6).max(128),
  phone: z.string().max(20).optional().nullable(),
  specialities: z.string().optional().nullable(),
  bankAccount: z.string().min(1).max(255),
  ssn: z.string().min(1).max(255),
  dni: z.string().min(1).max(255),
});

const updateCoachSchema = z.object({
  name: z.string().min(1).max(255).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  specialities: z.string().optional().nullable(),
});

const statusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

router.post(
  "/coaches",
  authenticate,
  requireRole(UserRole.ADMIN),
  validate(createCoachSchema),
  async (req, res, next) => {
    try {
      const coach = await container.createCoach.execute(req.body);
      res.status(201).json({
        id: coach.id,
        name: coach.name,
        email: coach.email,
        phone: coach.phone,
        specialities: coach.specialities,
        status: coach.status.toLowerCase(),
        createdAt: coach.createdAt,
      });
    } catch (err) {
      if (err instanceof Error && err.message === "Email already in use") {
        next(new ConflictError("Email already in use", "CONFLICT"));
      } else {
        next(err);
      }
    }
  },
);

router.get("/coaches", authenticate, requireRole(UserRole.ADMIN), async (req, res, next) => {
  try {
    const status = req.query.status ? (req.query.status as string).split(",") : undefined;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await container.listCoaches.execute({ status, page, limit });
    res.json({
      data: result.data.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        specialities: c.specialities,
        status: c.status.toLowerCase(),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/coaches/:id", authenticate, requireRole(UserRole.ADMIN), async (req, res, next) => {
  try {
    const coach = await container.getCoach.execute(req.params.id as string);
    if (!coach) {
      throw new NotFoundError("Coach not found");
    }
    res.json({
      id: coach.id,
      name: coach.name,
      email: coach.email,
      phone: coach.phone,
      specialities: coach.specialities,
      status: coach.status.toLowerCase(),
      createdAt: coach.createdAt,
      updatedAt: coach.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

router.put(
  "/coaches/:id",
  authenticate,
  requireRole(UserRole.ADMIN),
  validate(updateCoachSchema),
  async (req, res, next) => {
    try {
      const coach = await container.updateCoach.execute(req.params.id as string, req.body);
      res.json({
        id: coach.id,
        name: coach.name,
        email: coach.email,
        phone: coach.phone,
        specialities: coach.specialities,
        status: coach.status.toLowerCase(),
        createdAt: coach.createdAt,
        updatedAt: coach.updatedAt,
      });
    } catch (err) {
      if (err instanceof Error && err.message === "Email already in use") {
        next(new ConflictError("Email already in use", "CONFLICT"));
      } else {
        next(err);
      }
    }
  },
);

router.patch(
  "/coaches/:id/status",
  authenticate,
  requireRole(UserRole.ADMIN),
  validate(statusSchema),
  async (req, res, next) => {
    try {
      const coach = await container.updateCoachStatus.execute(
        req.params.id as string,
        req.body.status.toUpperCase(),
      );
      res.json({ id: coach.id, status: coach.status.toLowerCase() });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/coaches/:id/financial",
  authenticate,
  requireRole(UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const coachId = req.params.id as string;
      const data = await container.getCoachFinancialData.execute(coachId);

      const actorId = (req.user as { id: string }).id;
      await container.auditLogger.log({
        actorId,
        action: "VIEW_FINANCIAL_DATA",
        resource: "coach",
        resourceId: coachId,
        outcome: "SUCCESS",
      });

      res.json(data);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
