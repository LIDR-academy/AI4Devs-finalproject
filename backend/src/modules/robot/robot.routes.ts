import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { createRobotAction } from "./robot.service";
import { parseRobotActionInput } from "./robot.validators";

export const robotRouter = Router();

robotRouter.post(
  "/actions",
  asyncHandler(async (req, res) => {
    const input = parseRobotActionInput(req.body);
    const action = await createRobotAction(input);
    res.status(201).json({ action });
  })
);
