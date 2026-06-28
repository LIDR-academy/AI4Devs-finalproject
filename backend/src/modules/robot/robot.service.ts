import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import { actionCode } from "../../lib/code-generator";
import type { RobotActionInput } from "./robot.validators";

export const createRobotAction = async (input: RobotActionInput) => {
  const session = await prisma.unloadSession.findUnique({
    where: { id: input.sessionId }
  });

  if (!session) {
    throw new HttpError(404, "Session not found");
  }

  const currentCount = await prisma.robotAction.count({
    where: { sessionId: input.sessionId }
  });

  const action = await prisma.robotAction.create({
    data: {
      code: actionCode(currentCount),
      sessionId: input.sessionId,
      actionType: input.actionType,
      status: input.status,
      mode: input.mode,
      color: input.color,
      metadata: {
        dryRun: input.mode === "simulation",
        ...(input.metadata ?? {})
      }
    }
  });

  return {
    id: action.id,
    code: action.code,
    sessionId: action.sessionId,
    actionType: action.actionType,
    status: action.status,
    mode: action.mode,
    color: action.color,
    createdAt: action.createdAt
  };
};
