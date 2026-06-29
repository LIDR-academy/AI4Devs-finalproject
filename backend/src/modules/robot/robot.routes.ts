import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { createRobotAction, updateRobotAction } from "./robot.service";
import { parseRobotActionInput, parseRobotActionUpdateInput } from "./robot.validators";

export const robotRouter = Router();

robotRouter.post(
  "/actions",
  asyncHandler(async (req, res) => {
    const input = parseRobotActionInput(req.body);
    const action = await createRobotAction(input);
    res.status(201).json({ action });
  })
);

robotRouter.patch(
  "/actions/:id",
  asyncHandler(async (req, res) => {
    const action = await updateRobotAction(req.params.id, parseRobotActionUpdateInput(req.body));
    res.json({ action });
  })
);
