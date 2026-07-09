import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { parseCubesInput, parseStartSessionInput } from "./sessions.validators";
import { addCubesToSession, getSessionById, listSessions, startSession } from "./sessions.service";

export const sessionsRouter = Router();

sessionsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = parseStartSessionInput(req.body);
    const session = await startSession(input.truckCode);
    res.status(201).json({ session });
  })
);

sessionsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const sessions = await listSessions();
    res.json({ sessions });
  })
);

sessionsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const session = await getSessionById(req.params.id);
    res.json({ session });
  })
);

sessionsRouter.post(
  "/:id/cubes",
  asyncHandler(async (req, res) => {
    const cubes = parseCubesInput(req.body);
    const session = await addCubesToSession(req.params.id, cubes);
    res.status(201).json({ session });
  })
);
