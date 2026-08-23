import { Router } from "express";
import authRouter from "./auth.js";
import blocksRouter from "./blocks.js";
import classesRouter from "./classes.js";
import coacheesRouter from "./coachees.js";
import coachesRouter from "./coaches.js";
import healthRouter from "./health.js";
import levelsRouter from "./levels.js";
import notificationsRouter from "./notifications.js";

const router = Router();

router.use("/", healthRouter);
router.use("/", authRouter);
router.use("/", classesRouter);
router.use("/", blocksRouter);
router.use("/", coacheesRouter);
router.use("/", coachesRouter);
router.use("/", levelsRouter);
router.use("/", notificationsRouter);

export default router;
