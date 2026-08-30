import { UserRole } from "@prisma/client";
import { Router } from "express";
import { container } from "../../config/container.js";
import { deviceTokenSchema, listNotificationsQuerySchema } from "../dto/notificationSchemas.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get(
  "/notifications",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH, UserRole.COACHEE),
  validate(listNotificationsQuerySchema, "query"),
  async (req, res) => {
    const userId = req.user!.id;
    const query = req.query as unknown as {
      limit: number;
      cursor?: string;
      unread_only: boolean;
      today_only: boolean;
    };

    const result = await container.listNotifications.execute({
      recipientId: userId,
      todayOnly: query.today_only,
      unreadOnly: query.unread_only,
      cursor: query.cursor,
      limit: query.limit,
    });

    res.status(200).json({
      data: result.data.map((n) => ({
        id: n.id,
        notificationType: n.notificationType,
        content: n.content,
        isRead: n.isRead,
        sentAt: n.sentAt.toISOString(),
        classId: n.classId,
        createdAt: n.createdAt.toISOString(),
      })),
      meta: result.meta,
    });
  },
);

router.get(
  "/notifications/:id",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH, UserRole.COACHEE),
  async (req, res) => {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const notification = await container.getNotificationById.execute(id, userId);
    if (!notification) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Notification not found",
          ref: "GET /api/v1/notifications/:id",
        },
      });
    }

    res.status(200).json({
      id: notification.id,
      notificationType: notification.notificationType,
      content: notification.content,
      isRead: notification.isRead,
      sentAt: notification.sentAt.toISOString(),
      classId: notification.classId,
      createdAt: notification.createdAt.toISOString(),
    });
  },
);

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

router.patch(
  "/notifications/read-all",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH, UserRole.COACHEE),
  async (req, res) => {
    const userId = req.user!.id;

    const result = await container.markAllNotificationsAsRead.execute(userId);

    res.status(200).json({ count: result.count });
  },
);

router.patch(
  "/notifications/:id/read",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.COACH, UserRole.COACHEE),
  async (req, res) => {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const notification = await container.markNotificationAsRead.execute(id, userId);
    res.status(200).json({
      id: notification.id,
      notificationType: notification.notificationType,
      content: notification.content,
      isRead: notification.isRead,
      sentAt: notification.sentAt.toISOString(),
      classId: notification.classId,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    });
  },
);

export default router;
