import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { parseVisionSnapshotSyncInput } from "./vision.validators";
import { syncVisionSnapshot } from "./vision.service";

export const visionRouter = Router();

visionRouter.post(
  "/snapshots/sync",
  asyncHandler(async (req, res) => {
    const input = parseVisionSnapshotSyncInput(req.body);
    const result = await syncVisionSnapshot(input);
    res.status(200).json({ visionSync: result });
  })
);
