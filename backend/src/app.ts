import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { correlationId } from "./middleware/correlation-id";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/request-logger";
import { healthRouter } from "./modules/health/health.routes";
import { sessionsRouter } from "./modules/sessions/sessions.routes";
import { robotRouter } from "./modules/robot/robot.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { visionRouter } from "./modules/vision/vision.routes";

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(correlationId);
  app.use(requestLogger);

  app.use("/health", healthRouter);
  app.use("/sessions", sessionsRouter);
  app.use("/robot", robotRouter);
  app.use("/vision", visionRouter);
  app.use("/dashboard", dashboardRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
