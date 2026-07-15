import { UserRole } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { container } from "../../config/container.js";
import { ConflictError } from "../errors.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const createCoacheeSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().min(1).max(20),
  classTypePreference: z.enum(["INDIVIDUAL", "GROUP", "BOTH"]).optional().nullable(),
  levelId: z.string().uuid().optional().nullable(),
  additionalInfo: z.string().optional().nullable(),
});

const updateCoacheeSchema = z.object({
  name: z.string().min(1).max(255).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  classTypePreference: z.enum(["INDIVIDUAL", "GROUP", "BOTH"]).optional().nullable(),
  additionalInfo: z.string().optional().nullable(),
});

const statusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

const levelSchema = z.object({
  levelId: z.string().uuid(),
});

router.post(
  "/coachees",
  authenticate,
  requireRole(UserRole.ADMIN),
  validate(createCoacheeSchema),
  async (req, res, next) => {
    try {
      const coachee = await container.createCoachee.execute(req.body);
      res.status(201).json({
        id: coachee.id,
        name: coachee.name,
        email: coachee.email,
        phone: coachee.phone,
        classTypePreference: coachee.classTypePreference,
        status: coachee.status,
        level: coachee.levelId ? { id: coachee.levelId } : null,
        createdAt: coachee.createdAt,
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

router.get(
  "/coachees",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  async (req, res, next) => {
    try {
      const status = req.query.status ? (req.query.status as string).split(",") : undefined;
      const levelId = req.query.levelId ? (req.query.levelId as string).split(",") : undefined;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await container.listCoachees.execute({ status, levelId, page, limit });
      res.json({
        data: result.data.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          classTypePreference: c.classTypePreference,
          status: c.status,
          level: c.levelId ? { id: c.levelId } : null,
          additionalInfo: c.additionalInfo,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/coachees/:id",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  async (req, res, next) => {
    try {
      const coachee = await container.getCoachee.execute(req.params.id as string);
      res.json({
        id: coachee.id,
        name: coachee.name,
        email: coachee.email,
        phone: coachee.phone,
        classTypePreference: coachee.classTypePreference,
        status: coachee.status,
        level: coachee.levelId ? { id: coachee.levelId } : null,
        additionalInfo: coachee.additionalInfo,
        createdAt: coachee.createdAt,
        updatedAt: coachee.updatedAt,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/coachees/:id",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  validate(updateCoacheeSchema),
  async (req, res, next) => {
    try {
      const coachee = await container.updateCoachee.execute(req.params.id as string, req.body);
      res.json({
        id: coachee.id,
        name: coachee.name,
        email: coachee.email,
        phone: coachee.phone,
        classTypePreference: coachee.classTypePreference,
        status: coachee.status,
        level: coachee.levelId ? { id: coachee.levelId } : null,
        additionalInfo: coachee.additionalInfo,
        createdAt: coachee.createdAt,
        updatedAt: coachee.updatedAt,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  "/coachees/:id/status",
  authenticate,
  requireRole(UserRole.ADMIN),
  validate(statusSchema),
  async (req, res, next) => {
    try {
      const actorId = (req.user as { id: string }).id;
      const coachee = await container.updateCoacheeStatus.execute(
        req.params.id as string,
        req.body.status.toUpperCase(),
        actorId,
      );
      res.json({ id: coachee.id, status: coachee.status.toLowerCase() });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  "/coachees/:id/level",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH),
  validate(levelSchema),
  async (req, res, next) => {
    try {
      const actorId = (req.user as { id: string }).id;
      const coachee = await container.updateCoacheeLevel.execute(
        req.params.id as string,
        req.body.levelId,
        actorId,
      );
      res.json({ id: coachee.id, level: { id: coachee.levelId } });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
