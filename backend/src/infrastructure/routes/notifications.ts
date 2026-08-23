import { UserRole } from "@prisma/client";
import { Router } from "express";
import { container } from "../../config/container.js";
import { deviceTokenSchema } from "../dto/notificationSchemas.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/notifications", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.post(
  "/notifications/device-token",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH, UserRole.COACHEE),
  validate(deviceTokenSchema),
  async (req, res) => {
    const { token, platform } = req.body;
    const userId = req.user!.id;
    const result = await container.registerDeviceToken.execute({
      token,
      platform,
      userId,
    });
    res.status(200).json({
      id: result.id,
      platform: result.platform,
      createdAt: result.createdAt.toISOString(),
    });
  },
);

router.patch("/notifications/:id/read", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

export default router;
