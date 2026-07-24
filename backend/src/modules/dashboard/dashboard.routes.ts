import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { HttpError } from "../../lib/http-error";
import { getOperationalDashboard, resetOperationalDashboard } from "./dashboard.service";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/operational",
  asyncHandler(async (_req, res) => {
    const dashboard = await getOperationalDashboard();
    res.json(dashboard);
  })
);

dashboardRouter.post(
  "/operational/reset",
  asyncHandler(async (req, res) => {
    const mode = req.body?.mode;
    const closeActiveSessionAs = req.body?.closeActiveSessionAs ?? "cancelled";

    if (mode !== "start-day" && mode !== "next-truck") {
      throw new HttpError(400, "mode must be start-day or next-truck");
    }
    if (closeActiveSessionAs !== "cancelled" && closeActiveSessionAs !== "completed") {
      throw new HttpError(400, "closeActiveSessionAs must be cancelled or completed");
    }

    const result = await resetOperationalDashboard({ mode, closeActiveSessionAs });
    res.json(result);
  })
);
