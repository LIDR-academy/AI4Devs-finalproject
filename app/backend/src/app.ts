import cors from "cors";
import express from "express";
import { projectsRouter } from "./modules/projects/routes";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import { attachActorContext } from "./middlewares/auth";
import { createRateLimiter, applySecurityHeaders } from "./middlewares/security";
import { env } from "./config/env";
import { attachRequestContext, logRequestLifecycle } from "./middlewares/observability";
import { telemetry } from "./lib/telemetry";
import { authRouter } from "./modules/auth/routes";

export const app = express();

app.set("trust proxy", 1);

const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    }
  })
);

app.use(applySecurityHeaders);
app.use(createRateLimiter(env.RATE_LIMIT_WINDOW_MS, env.RATE_LIMIT_MAX_REQUESTS));
app.use(attachRequestContext);
app.use(logRequestLifecycle);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/metrics", (_req, res) => {
  res.status(200).json(telemetry.getSnapshot());
});

app.use("/auth", authRouter);
app.use("/projects", attachActorContext, projectsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
