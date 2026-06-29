import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import { actionCode } from "../../lib/code-generator";
import type { RobotActionInput } from "./robot.validators";
import type { RobotActionUpdateInput } from "./robot.validators";
import { mergeRobotMetadataForTransition } from "./robot.metadata";
import { Prisma } from "@prisma/client";

const mapAction = (action: {
  id: string; code: string; sessionId: string; actionType: string; status: string;
  mode: "simulation" | "hardware"; color: string | null; metadata: unknown;
  createdAt: Date; updatedAt: Date;
}) => ({
  id: action.id,
  code: action.code,
  sessionId: action.sessionId,
  actionType: action.actionType,
  status: action.status,
  mode: action.mode,
  color: action.color,
  metadata: action.metadata,
  createdAt: action.createdAt,
  updatedAt: action.updatedAt
});

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
      metadata: input.metadata as Prisma.InputJsonObject
    }
  });

  return mapAction(action);
};

export const updateRobotAction = async (id: string, input: RobotActionUpdateInput) => {
  const current = await prisma.robotAction.findUnique({ where: { id } });
  if (!current) throw new HttpError(404, "Robot action not found");
  if (current.status === input.status) return mapAction(current);
  if (current.status !== "PLANNED") {
    throw new HttpError(409, `Robot action cannot transition from ${current.status} to ${input.status}`);
  }

  const existingMetadata =
    current.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)
      ? (current.metadata as Record<string, unknown>)
      : {};
  const metadata = mergeRobotMetadataForTransition(
    existingMetadata,
    input.metadata,
    current.mode
  ) as Prisma.InputJsonObject;
  const updated = await prisma.robotAction.update({
    where: { id },
    data: { status: input.status, metadata }
  });
  return mapAction(updated);
};
