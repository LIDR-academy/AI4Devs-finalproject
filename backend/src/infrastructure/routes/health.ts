import type { Request, Response } from "express";
import { Router } from "express";
import { container } from "../../config/container.js";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  const calendarHealth = container.calendarHealthMonitor.getHealth();
  const now = new Date();
  const utcTimestamp = now.toISOString();

  if (calendarHealth.status === "degraded") {
    res.status(200).json({
      status: "ok",
      timestamp: utcTimestamp,
      calendar: calendarHealth,
    });
    return;
  }

  res.status(200).json({
    status: "ok",
    timestamp: utcTimestamp,
    calendar: calendarHealth,
  });
});

export default router;
