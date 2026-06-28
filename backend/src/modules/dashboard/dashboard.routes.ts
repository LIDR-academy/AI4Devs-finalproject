import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { getOperationalDashboard } from "./dashboard.service";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/operational",
  asyncHandler(async (_req, res) => {
    const dashboard = await getOperationalDashboard();
    res.json(dashboard);
  })
);
