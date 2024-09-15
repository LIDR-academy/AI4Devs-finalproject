import { Router } from "express";
import { ActivityController } from "../controllers/ActivityController";

const router = Router();
const activityController = new ActivityController();

router.get("/:id", (req, res, next) => activityController.getActivityById(req, res, next));
router.post("/", (req, res, next) => activityController.createActivity(req, res, next));

export default router;